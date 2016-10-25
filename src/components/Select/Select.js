import React from 'react';
import Select from 'react-select';

import control from './Control.css';
import menu from './Menu.css';
import multi from './Multi.css';

import style from './Select.css';

const wrap = component => props => (
  <div className={[style.select, control.wrap, menu.wrap, multi.wrap].join(' ')}>
    { React.createElement(component, props) }
  </div>
);

const wrappedSelect = wrap(Select);
wrappedSelect.Async = wrap(Select.Async);

export default wrappedSelect;
