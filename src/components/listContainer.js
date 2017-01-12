import React from 'react';
import DropDown from './dropDown';
import List from '../containers/list';

const ListContainer = () =>
  <div className="list">
    <div className="list-header">
      <h5 className="list-text">Sort Restaurants By:</h5>
      <DropDown />
    </div>
    <List />
  </div>;

export default ListContainer;