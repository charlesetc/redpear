(() => {
  // node_modules/solid-js/dist/solid.js
  var sharedConfig = {};
  function setHydrateContext(context) {
    sharedConfig.context = context;
  }
  var equalFn = (a, b) => a === b;
  var $PROXY = Symbol("solid-proxy");
  var $TRACK = Symbol("solid-track");
  var $DEVCOMP = Symbol("solid-dev-component");
  var signalOptions = {
    equals: equalFn
  };
  var ERROR = null;
  var runEffects = runQueue;
  var STALE = 1;
  var PENDING = 2;
  var UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  var Owner = null;
  var Transition = null;
  var Scheduler = null;
  var ExternalSourceFactory = null;
  var Listener = null;
  var Updates = null;
  var Effects = null;
  var ExecCount = 0;
  var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        if (Transition && Transition.running && Transition.sources.has(s))
          value2 = value2(s.tValue);
        else
          value2 = value2(s.value);
      }
      return writeSignal(s, value2);
    };
    return [readSignal.bind(s), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c = createComputation(fn, value, false, STALE);
    if (Scheduler && Transition && Transition.running)
      Updates.push(c);
    else
      updateComputation(c);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c = createComputation(fn, value, false, STALE), s = SuspenseContext && lookup(Owner, SuspenseContext.id);
    if (s)
      c.suspense = s;
    c.user = true;
    Effects ? Effects.push(c) : updateComputation(c);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c = createComputation(fn, value, true, 0);
    c.observers = null;
    c.observerSlots = null;
    c.comparator = options.equals || void 0;
    if (Scheduler && Transition && Transition.running) {
      c.tState = STALE;
      Updates.push(c);
    } else
      updateComputation(c);
    return readSignal.bind(c);
  }
  function untrack(fn) {
    const listener = Listener;
    Listener = null;
    try {
      return fn();
    } finally {
      Listener = listener;
    }
  }
  function on(deps, fn, options) {
    const isArray = Array.isArray(deps);
    let prevInput;
    let defer = options && options.defer;
    return (prevValue) => {
      let input;
      if (isArray) {
        input = Array(deps.length);
        for (let i = 0; i < deps.length; i++)
          input[i] = deps[i]();
      } else
        input = deps();
      if (defer) {
        defer = false;
        return void 0;
      }
      const result = untrack(() => fn(input, prevInput, prevValue));
      prevInput = input;
      return result;
    };
  }
  function onCleanup(fn) {
    if (Owner === null)
      ;
    else if (Owner.cleanups === null)
      Owner.cleanups = [fn];
    else
      Owner.cleanups.push(fn);
    return fn;
  }
  function startTransition(fn) {
    if (Transition && Transition.running) {
      fn();
      return Transition.done;
    }
    const l = Listener;
    const o = Owner;
    return Promise.resolve().then(() => {
      Listener = l;
      Owner = o;
      let t;
      if (Scheduler || SuspenseContext) {
        t = Transition || (Transition = {
          sources: /* @__PURE__ */ new Set(),
          effects: [],
          promises: /* @__PURE__ */ new Set(),
          disposed: /* @__PURE__ */ new Set(),
          queue: /* @__PURE__ */ new Set(),
          running: true
        });
        t.done || (t.done = new Promise((res) => t.resolve = res));
        t.running = true;
      }
      runUpdates(fn, false);
      Listener = Owner = null;
      return t ? t.done : void 0;
    });
  }
  function createContext(defaultValue, options) {
    const id = Symbol("context");
    return {
      id,
      Provider: createProvider(id),
      defaultValue
    };
  }
  function children(fn) {
    const children2 = createMemo(fn);
    const memo = createMemo(() => resolveChildren(children2()));
    memo.toArray = () => {
      const c = memo();
      return Array.isArray(c) ? c : c != null ? [c] : [];
    };
    return memo;
  }
  var SuspenseContext;
  function readSignal() {
    const runningTransition = Transition && Transition.running;
    if (this.sources && (!runningTransition && this.state || runningTransition && this.tState)) {
      if (!runningTransition && this.state === STALE || runningTransition && this.tState === STALE)
        updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    if (runningTransition && Transition.sources.has(this))
      return this.tValue;
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      if (Transition) {
        const TransitionRunning = Transition.running;
        if (TransitionRunning || !isComp && Transition.sources.has(node)) {
          Transition.sources.add(node);
          node.tValue = value;
        }
        if (!TransitionRunning)
          node.value = value;
      } else
        node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i = 0; i < node.observers.length; i += 1) {
            const o = node.observers[i];
            const TransitionRunning = Transition && Transition.running;
            if (TransitionRunning && Transition.disposed.has(o))
              continue;
            if (TransitionRunning && !o.tState || !TransitionRunning && !o.state) {
              if (o.pure)
                Updates.push(o);
              else
                Effects.push(o);
              if (o.observers)
                markDownstream(o);
            }
            if (TransitionRunning)
              o.tState = STALE;
            else
              o.state = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (false)
              ;
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn)
      return;
    cleanNode(node);
    const owner = Owner, listener = Listener, time = ExecCount;
    Listener = Owner = node;
    runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
    if (Transition && !Transition.running && Transition.sources.has(node)) {
      queueMicrotask(() => {
        runUpdates(() => {
          Transition && (Transition.running = true);
          Listener = Owner = node;
          runComputation(node, node.tValue, time);
          Listener = Owner = null;
        }, false);
      });
    }
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure)
        Transition && Transition.running ? node.tState = STALE : node.state = STALE;
      handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue, true);
      } else if (Transition && Transition.running && node.pure) {
        Transition.sources.add(node);
        node.tValue = nextValue;
      } else
        node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: null,
      pure
    };
    if (Transition && Transition.running) {
      c.state = 0;
      c.tState = state;
    }
    if (Owner === null)
      ;
    else if (Owner !== UNOWNED) {
      if (Transition && Transition.running && Owner.pure) {
        if (!Owner.tOwned)
          Owner.tOwned = [c];
        else
          Owner.tOwned.push(c);
      } else {
        if (!Owner.owned)
          Owner.owned = [c];
        else
          Owner.owned.push(c);
      }
    }
    if (ExternalSourceFactory) {
      const [track, trigger] = createSignal(void 0, {
        equals: false
      });
      const ordinary = ExternalSourceFactory(c.fn, trigger);
      onCleanup(() => ordinary.dispose());
      const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
      const inTransition = ExternalSourceFactory(c.fn, triggerInTransition);
      c.fn = (x) => {
        track();
        return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
      };
    }
    return c;
  }
  function runTop(node) {
    const runningTransition = Transition && Transition.running;
    if (!runningTransition && node.state === 0 || runningTransition && node.tState === 0)
      return;
    if (!runningTransition && node.state === PENDING || runningTransition && node.tState === PENDING)
      return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (runningTransition && Transition.disposed.has(node))
        return;
      if (!runningTransition && node.state || runningTransition && node.tState)
        ancestors.push(node);
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (runningTransition) {
        let top = node, prev = ancestors[i + 1];
        while ((top = top.owner) && top !== prev) {
          if (Transition.disposed.has(top))
            return;
        }
      }
      if (!runningTransition && node.state === STALE || runningTransition && node.tState === STALE) {
        updateComputation(node);
      } else if (!runningTransition && node.state === PENDING || runningTransition && node.tState === PENDING) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates)
      return fn();
    let wait = false;
    if (!init)
      Updates = [];
    if (Effects)
      wait = true;
    else
      Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait);
      return res;
    } catch (err) {
      if (!Updates)
        Effects = null;
      handleError(err);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      if (Scheduler && Transition && Transition.running)
        scheduleQueue(Updates);
      else
        runQueue(Updates);
      Updates = null;
    }
    if (wait)
      return;
    let res;
    if (Transition) {
      if (!Transition.promises.size && !Transition.queue.size) {
        const sources = Transition.sources;
        const disposed = Transition.disposed;
        Effects.push.apply(Effects, Transition.effects);
        res = Transition.resolve;
        for (const e2 of Effects) {
          "tState" in e2 && (e2.state = e2.tState);
          delete e2.tState;
        }
        Transition = null;
        runUpdates(() => {
          for (const d of disposed)
            cleanNode(d);
          for (const v of sources) {
            v.value = v.tValue;
            if (v.owned) {
              for (let i = 0, len = v.owned.length; i < len; i++)
                cleanNode(v.owned[i]);
            }
            if (v.tOwned)
              v.owned = v.tOwned;
            delete v.tValue;
            delete v.tOwned;
            v.tState = 0;
          }
          setTransPending(false);
        }, false);
      } else if (Transition.running) {
        Transition.running = false;
        Transition.effects.push.apply(Transition.effects, Effects);
        Effects = null;
        setTransPending(true);
        return;
      }
    }
    const e = Effects;
    Effects = null;
    if (e.length)
      runUpdates(() => runEffects(e), false);
    if (res)
      res();
  }
  function runQueue(queue) {
    for (let i = 0; i < queue.length; i++)
      runTop(queue[i]);
  }
  function scheduleQueue(queue) {
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const tasks = Transition.queue;
      if (!tasks.has(item)) {
        tasks.add(item);
        Scheduler(() => {
          tasks.delete(item);
          runUpdates(() => {
            Transition.running = true;
            runTop(item);
          }, false);
          Transition && (Transition.running = false);
        });
      }
    }
  }
  function runUserEffects(queue) {
    let i, userLength = 0;
    for (i = 0; i < queue.length; i++) {
      const e = queue[i];
      if (!e.user)
        runTop(e);
      else
        queue[userLength++] = e;
    }
    if (sharedConfig.context)
      setHydrateContext();
    for (i = 0; i < userLength; i++)
      runTop(queue[i]);
  }
  function lookUpstream(node, ignore) {
    const runningTransition = Transition && Transition.running;
    if (runningTransition)
      node.tState = 0;
    else
      node.state = 0;
    for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
        if (!runningTransition && source.state === STALE || runningTransition && source.tState === STALE) {
          if (source !== ignore)
            runTop(source);
        } else if (!runningTransition && source.state === PENDING || runningTransition && source.tState === PENDING)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    const runningTransition = Transition && Transition.running;
    for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (!runningTransition && !o.state || runningTransition && !o.tState) {
        if (runningTransition)
          o.tState = PENDING;
        else
          o.state = PENDING;
        if (o.pure)
          Updates.push(o);
        else
          Effects.push(o);
        o.observers && markDownstream(o);
      }
    }
  }
  function cleanNode(node) {
    let i;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          const n = obs.pop(), s = source.observerSlots.pop();
          if (index < obs.length) {
            n.sourceSlots[s] = index;
            obs[index] = n;
            source.observerSlots[index] = s;
          }
        }
      }
    }
    if (Transition && Transition.running && node.pure) {
      if (node.tOwned) {
        for (i = 0; i < node.tOwned.length; i++)
          cleanNode(node.tOwned[i]);
        delete node.tOwned;
      }
      reset(node, true);
    } else if (node.owned) {
      for (i = 0; i < node.owned.length; i++)
        cleanNode(node.owned[i]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i = 0; i < node.cleanups.length; i++)
        node.cleanups[i]();
      node.cleanups = null;
    }
    if (Transition && Transition.running)
      node.tState = 0;
    else
      node.state = 0;
    node.context = null;
  }
  function reset(node, top) {
    if (!top) {
      node.tState = 0;
      Transition.disposed.add(node);
    }
    if (node.owned) {
      for (let i = 0; i < node.owned.length; i++)
        reset(node.owned[i]);
    }
  }
  function castError(err) {
    if (err instanceof Error || typeof err === "string")
      return err;
    return new Error("Unknown error");
  }
  function handleError(err) {
    err = castError(err);
    const fns = ERROR && lookup(Owner, ERROR);
    if (!fns)
      throw err;
    for (const f of fns)
      f(err);
  }
  function lookup(owner, key) {
    return owner ? owner.context && owner.context[key] !== void 0 ? owner.context[key] : lookup(owner.owner, key) : void 0;
  }
  function resolveChildren(children2) {
    if (typeof children2 === "function" && !children2.length)
      return resolveChildren(children2());
    if (Array.isArray(children2)) {
      const results = [];
      for (let i = 0; i < children2.length; i++) {
        const result = resolveChildren(children2[i]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children2;
  }
  function createProvider(id, options) {
    return function provider(props) {
      let res;
      createRenderEffect(() => res = untrack(() => {
        Owner.context = {
          [id]: props.value
        };
        return children(() => props.children);
      }), void 0);
      return res;
    };
  }
  var FALLBACK = Symbol("fallback");
  var SuspenseListContext = createContext();

  // frontend/helpers.js
  function sethtml(parent, ...children2) {
    parent.innerHTML = "";
    for (let child of children2) {
      parent.appendChild(child);
    }
  }
  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
  var words = [
    "air",
    "ash",
    "bay",
    "bee",
    "birch",
    "bird",
    "blue",
    "branch",
    "breeze",
    "brook",
    "bud",
    "cat",
    "clay",
    "cliff",
    "cloud",
    "clove",
    "coast",
    "crest",
    "dawn",
    "day",
    "doe",
    "dove",
    "dusk",
    "dust",
    "earth",
    "elm",
    "fawn",
    "fern",
    "fig",
    "finch",
    "fir",
    "fjord",
    "flax",
    "flint",
    "fox",
    "frost",
    "gale",
    "gem",
    "glow",
    "gold",
    "grain",
    "grey",
    "grove",
    "hawk",
    "hue",
    "ice",
    "ink",
    "jade",
    "koi",
    "lake",
    "lark",
    "leaf",
    "light",
    "lime",
    "loch",
    "lynx",
    "mars",
    "marsh",
    "may",
    "mist",
    "moon",
    "moss",
    "night",
    "north",
    "oak",
    "oat",
    "onyx",
    "ox",
    "peach",
    "pearl",
    "pine",
    "pink",
    "plum",
    "pond",
    "quartz",
    "quince",
    "rain",
    "ray",
    "rock",
    "rush",
    "rye",
    "sage",
    "sand",
    "sea",
    "shade",
    "shell",
    "silk",
    "sky",
    "snow",
    "spring",
    "spruce",
    "star",
    "stone",
    "storm",
    "teal",
    "tree",
    "vale",
    "vine",
    "wave",
    "wild",
    "wood"
  ];
  function creativeName() {
    let word = words[Math.floor(Math.random() * words.length)];
    let number = Math.floor(Math.random() * 10);
    return word + number;
  }

  // node_modules/bourbon-vanilla/jsx-runtime.js
  function Fragment(props, children2) {
    let fragment = document.createDocumentFragment();
    if (Array.isArray(children2)) {
      for (const child of children2 || []) {
        fragment.appendChild(child);
      }
    } else {
      fragment.appendChild(children2);
    }
    return fragment;
  }
  var appendChildren = (parent, children2) => {
    if (children2 === null || children2 === void 0)
      return;
    if (Array.isArray(children2)) {
      for (const child of children2) {
        appendChildren(parent, child);
      }
    } else {
      let child = children2;
      parent.appendChild(
        child?.nodeType ? child : document.createTextNode(child)
      );
    }
  };
  function jsx(tag, { children: children2, ...props }) {
    if (typeof tag === "function") {
      return tag(props, children2);
    }
    const element = document.createElement(tag);
    Object.entries(props || {}).forEach(([name, value]) => {
      if (name.startsWith("on") && name.toLowerCase() in window) {
        element.addEventListener(name.toLowerCase().substr(2), value);
      } else {
        element.setAttribute(name, value);
      }
    });
    appendChildren(element, children2);
    return element;
  }
  var jsxs = jsx;

  // frontend/main.jsx
  var initialValue = {
    stack: {
      type: "vertical",
      contents: [
        { text: { content: "apple" } },
        { text: { content: "banana" } },
        {
          stack: {
            type: "horizontal",
            contents: [
              { text: { content: "pear" } },
              { text: { content: "orange" } },
              { button: { content: "submit" } }
            ]
          }
        }
      ]
    }
  };
  var [currentlySelected, setCurrentlySelected] = createSignal(null);
  var lastSelected = null;
  createEffect(
    on(currentlySelected, (currentlySelected2) => {
      lastSelected?.classList?.remove("selected");
      currentlySelected2?.classList?.add("selected");
      if (currentlySelected2?.onSelected)
        currentlySelected2.onSelected();
      lastSelected = currentlySelected2;
    })
  );
  function removeWidget(div) {
    if (div.previousSibling) {
      setCurrentlySelected(div.previousSibling);
    } else {
      setCurrentlySelected(div.parentNode);
    }
    div.remove();
  }
  function box(div) {
    let [margin, setMargin] = createSignal(20);
    let [padding, setPadding] = createSignal(10);
    let [borderWidth, setBorderWidth] = createSignal(1);
    let [borderColor, setBorderColor] = createSignal("#ffdb29");
    let [backgroundColor, setBackgroundColor] = createSignal();
    let [borderRadius, setBorderRadius] = createSignal(4);
    createEffect(() => {
      div.style.margin = margin() + "px";
    });
    createEffect(() => {
      div.style.padding = padding() + "px";
    });
    createEffect(() => {
      div.style.border = `${borderWidth()}px solid ${borderColor()}`;
      if (borderWidth() > 3) {
        div.classList.remove("no-border");
        div.classList.add("big-border");
      } else if (borderWidth() <= 0) {
        div.classList.remove("big-border");
        div.classList.add("no-border");
      } else {
        div.classList.remove("no-border");
        div.classList.remove("big-border");
      }
    });
    createEffect(() => {
      div.style.borderRadius = borderRadius() + "px";
    });
    createEffect(() => {
      div.style.backgroundColor = backgroundColor();
    });
    div.margin = margin;
    div.setMargin = setMargin;
    div.padding = padding;
    div.setPadding = setPadding;
    div.borderWidth = borderWidth;
    div.setBorderWidth = setBorderWidth;
    div.borderColor = borderColor;
    div.setBorderColor = setBorderColor;
    div.backgroundColor = backgroundColor;
    div.setBackgroundColor = setBackgroundColor;
    div.borderRadius = borderRadius;
    div.setBorderRadius = setBorderRadius;
  }
  function Stack({ contents, type: initialType }) {
    const [type, setType] = createSignal(initialType);
    let childElements = [];
    for (let child of contents) {
      childElements.push(/* @__PURE__ */ jsx(Value, { ...child }));
    }
    let div = /* @__PURE__ */ jsx(
      "div",
      {
        class: "component stack",
        onClick: (e) => {
          if (e.target === div) {
            setCurrentlySelected(div);
          }
        },
        children: childElements
      }
    );
    createEffect(() => {
      div.classList.toggle("vertical", type() === "vertical");
      div.classList.toggle("horizontal", type() !== "vertical");
    });
    div.setType = setType;
    div.type = type;
    div.name = "stack";
    div.backspacePressed = (e) => {
      removeWidget(div);
      e.preventDefault();
    };
    box(div);
    return div;
  }
  function Chooser({ lastSelected: lastSelected2 }) {
    let div, input;
    function closeChooser() {
      setCurrentlySelected(lastSelected2);
      div.remove();
    }
    let lines = [
      /* @__PURE__ */ jsx("div", { class: "line", children: "stack" }),
      /* @__PURE__ */ jsx("div", { class: "line", children: "text" }),
      /* @__PURE__ */ jsx("div", { class: "line", children: "button" })
    ];
    let linesContainer = /* @__PURE__ */ jsx("div", { class: "lines", children: lines });
    let filterLines = () => lines.filter((line) => line.textContent.includes(input.value));
    input = /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        onBlur: closeChooser,
        onKeyDown: (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            closeChooser();
          } else if (e.key === "Backspace" && input.value === "") {
            e.preventDefault();
            closeChooser();
          } else if (e.key === "Enter") {
            e.preventDefault();
            let results = filterLines();
            if (results.length > 0) {
              let choice = results[0];
              if (choice.textContent === "stack") {
                let stack = /* @__PURE__ */ jsx(Stack, { type: "vertical", contents: [] });
                insertAfter(div, stack);
                div.remove();
                setCurrentlySelected(stack);
              } else if (choice.textContent === "text") {
                let text = /* @__PURE__ */ jsx(Text, { content: "" });
                insertAfter(div, text);
                div.remove();
                setCurrentlySelected(text);
              } else if (choice.textContent === "button") {
                let button = /* @__PURE__ */ jsx(Button, { content: "submit" });
                insertAfter(div, button);
                div.remove();
                setCurrentlySelected(button);
              }
            }
          }
        },
        onKeyUp: (e) => {
          let value = e.target.value;
          let results = filterLines();
          if (results.length === 0) {
            sethtml(linesContainer, /* @__PURE__ */ jsx("div", { children: "no results" }));
          } else {
            sethtml(linesContainer, ...results);
          }
        }
      }
    );
    div = /* @__PURE__ */ jsxs("div", { class: "chooser", children: [
      input,
      linesContainer
    ] });
    setCurrentlySelected(null);
    setTimeout(() => input.focus(), 10);
    return div;
  }
  var controlPressed = false;
  function slashOpensChooser(e, div, input) {
    if (e.key === "Control") {
      controlPressed = true;
    } else if (e.key === "\\" && !controlPressed) {
      e.preventDefault();
      insertAfter(div, /* @__PURE__ */ jsx(Chooser, { lastSelected: div }));
    } else if (e.key === "\\" && controlPressed) {
      let start = input.selectionStart;
      let end = input.selectionEnd;
      let value = input.value;
      input.value = value.slice(0, start) + "\\" + value.slice(end);
      input.selectionStart = input.selectionEnd = start + 1;
    }
  }
  function Text({ content: initialContent }) {
    let div, input;
    function resizeToTextHeight(item) {
      item.style.height = 0;
      item.style.height = item.scrollHeight + "px";
    }
    function editMode() {
      setCurrentlySelected(div);
      if (input !== document.activeElement) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      }
      resizeToTextHeight(input);
    }
    function displayMode() {
      resizeToTextHeight(input);
    }
    input = /* @__PURE__ */ jsx(
      "textarea",
      {
        onFocus: editMode,
        onBlur: displayMode,
        onKeyDown: (e) => {
          e.stopPropagation();
          if (e.key === "Backspace" && input.value === "") {
            removeWidget(div);
            e.preventDefault(e);
          } else {
            slashOpensChooser(e, div, input);
          }
        },
        onKeyUp: (e) => {
          if (e.key === "Control") {
            controlPressed = false;
          }
        },
        onInput: () => resizeToTextHeight(input),
        children: initialContent
      }
    );
    div = /* @__PURE__ */ jsx(
      "div",
      {
        class: "component text",
        onClick: editMode,
        children: input
      }
    );
    div.name = "text";
    setTimeout(() => resizeToTextHeight(input), 4);
    box(div);
    div.onSelected = () => {
      editMode();
    };
    div.input = input;
    return div;
  }
  function Button({ content: initialContent }) {
    let div, button, input;
    let [content, setContent] = createSignal(initialContent);
    function editingMode() {
      sethtml(div, input);
      input.focus();
      input.select();
      resizeToTextWidth();
    }
    function onFocus() {
      if (currentlySelected() !== div) {
        setCurrentlySelected(div);
        editingMode();
      }
    }
    button = /* @__PURE__ */ jsx("button", { onFocus, children: content() });
    function resizeToTextWidth() {
      input.style.width = 0;
      input.style.width = input.scrollWidth - 20 + "px";
    }
    input = /* @__PURE__ */ jsx(
      "input",
      {
        value: content(),
        onBlur: (e) => sethtml(div, button),
        onKeyDown: (e) => {
          if (e.key === "Backspace" && content() === "") {
            removeWidget(div);
            e.preventDefault(e);
          } else {
            slashOpensChooser(e, div, input);
          }
        },
        onInput: (e) => {
          setContent(e.target.value);
          resizeToTextWidth();
        }
      }
    );
    createEffect(() => {
      button.textContent = content();
    });
    div = /* @__PURE__ */ jsx(
      "div",
      {
        class: "component button",
        onClick: onFocus,
        children: button
      }
    );
    div.name = "button";
    box(div);
    div.onSelected = () => {
      editingMode();
    };
    return div;
  }
  function Value(value) {
    if (value.stack) {
      return /* @__PURE__ */ jsx(Stack, { ...value.stack });
    } else if (value.text) {
      return /* @__PURE__ */ jsx(Text, { ...value.text });
    } else if (value.button) {
      return /* @__PURE__ */ jsx(Button, { ...value.button });
    } else {
      throw "no such element type";
    }
  }
  function Var({ name }) {
    let initialValue2 = "";
    let input, textarea;
    function resizeToTextHeight() {
      textarea.style.height = 0 + "px";
      textarea.style.height = textarea.scrollHeight - 20 + "px";
    }
    function resizeToTextWidth() {
      input.style.width = 0 + "px";
      input.style.width = Math.max(input.scrollWidth, 20) + "px";
    }
    textarea = /* @__PURE__ */ jsx("textarea", { onInput: resizeToTextHeight, children: initialValue2 });
    input = /* @__PURE__ */ jsx(
      "input",
      {
        value: name,
        onInput: (e) => {
          resizeToTextWidth();
        }
      }
    );
    let div = /* @__PURE__ */ jsxs("div", { class: "var", children: [
      "let ",
      input,
      " = ",
      textarea
    ] });
    setTimeout(() => {
      resizeToTextHeight();
      resizeToTextWidth();
    }, 4);
    return div;
  }
  function LocalVars() {
    let vars = /* @__PURE__ */ jsx("div", { class: "vars" });
    function newVar() {
      vars.appendChild(/* @__PURE__ */ jsx(Var, { name: creativeName() }));
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "Local vars",
        " ",
        /* @__PURE__ */ jsx("button", { onClick: newVar, class: "new-var", children: "+ new" })
      ] }),
      vars
    ] });
  }
  function Apricot() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape")
        setCurrentlySelected(null);
    });
    let hovered = null;
    function setHovered(target) {
      if (target.classList.contains("component") && target !== hovered) {
        hovered?.classList.remove("hovered");
        target.classList.add("hovered");
        hovered = target;
      }
    }
    let value = /* @__PURE__ */ jsx(Value, { ...initialValue });
    setCurrentlySelected(value);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("main", { onMouseMove: (e) => setHovered(e.target), children: [
        /* @__PURE__ */ jsx("h1", { class: "title", children: "Apricot" }),
        /* @__PURE__ */ jsx("div", { class: "vars" }),
        /* @__PURE__ */ jsx(LocalVars, {}),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("p", { children: "Page" }),
        /* @__PURE__ */ jsx("div", { class: "toplevel", children: value })
      ] }),
      /* @__PURE__ */ jsx("p", { style: "display: none", children: "hi" })
    ] });
  }
  window.onload = () => {
    document.getElementById("root").appendChild(/* @__PURE__ */ jsx(Apricot, {}));
  };
  document.addEventListener("keydown", (e) => {
    console.log(e.key);
    if (e.key === "\\") {
      e.preventDefault();
      currentlySelected()?.appendChild(
        /* @__PURE__ */ jsx(Chooser, { lastSelected: currentlySelected() })
      );
    } else if (e.key === "Backspace") {
      currentlySelected()?.backspacePressed(e);
    }
  });
})();
