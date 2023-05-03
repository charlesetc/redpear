import React from 'react';
import { useState } from 'react';
import { styled, globalCss } from '@stitches/react';
import useSWR from 'swr';
import { fetcher } from './helpers';

const Container = styled('section', {
  padding: '100px',
})

function App(b) {
  const id = window.location.pathname.split('/').at(-1)
  const { data, error, isLoading } = useSWR(`/api/project/${id}`, fetcher)

  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState(0);

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return (
    <Container className="App">
      <h3>Data</h3>

      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      <input type="range" min="0" max="100" value={age} onChange={(e) => setAge(e.target.value)} />

      {/* display the name and age */}
      <p>Your name is {name} and you are {age} years old</p>
    </Container>
  );
}

export default App;
