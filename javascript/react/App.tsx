import React from 'react';
import { useState } from 'react';
import { styled, globalCss } from '@stitches/react';

import useSWR from 'swr';
const Container = styled('section', {
  padding: '100px',
})

const fetcher = (...args) => fetch(...args).then(res => res.json())

function App() {
  const id = window.location.pathname.split('/').at(-1)
  const { data, error, isLoading } = useSWR(`/api/project/${id}`, fetcher)

  // TODO: implement that api
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState(0);


  return (
    <Container className="App">
      <h1>Red Pear</h1>

      <p style={{ display: 'flex', flexDirection: 'column', width: '200px' }}>

        {/* name input with the useState all wired up */}
        Name <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
        Age
        {/* age range input with the useState all wired up */}
        <input type="range" min="0" max="100" value={age} onChange={(e) => setAge(e.target.value)} />
        {/* also display the range */}
        <span>{age}</span>
      </p>

      {/* display the name and age */}
      <p>Your name is {name} and you are {age} years old</p>

    </Container>
  );
}

export default App;
