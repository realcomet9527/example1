import React, { useState } from 'react';
import { BlockRequiredProps } from '../../../interfaces/PropTypes';
import { handleRequest } from '../../utils/handleRequest';

const InsertStep = ({ superblock, block }: BlockRequiredProps) => {
  const [num, setNum] = useState(0);

  const click = handleRequest(() =>
    fetch(`http://localhost:3200/${superblock}/${block}/_tools/insert-step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ num })
    })
  );

  const changeNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNum(parseInt(e.target.value, 10));
  };

  return (
    <div>
      <label htmlFor='num'>
        Step to insert AFTER:
        <input id='num' type='number' onChange={changeNum} />
      </label>
      <button onClick={click}>Insert Step</button>
    </div>
  );
};

export default InsertStep;
