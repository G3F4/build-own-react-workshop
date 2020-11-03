import React from 'react';

function CustomComponent({ text }: { text: string }) {
  return <div>{text}</div>;
}

export default function AppWithComponent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h1>Awesome App with components!</h1>
      <CustomComponent text="YEAH!" />
    </div>
  );
}
