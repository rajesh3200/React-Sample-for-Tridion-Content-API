import React from 'react';

export default class Taxonomies extends React.Component { 
constructor(props) {
    super(props);
   
    this._changeHandler = this._changeHandler.bind(this);
  }

    render() { 
    	const { taxonomies = [] } = this.props;

	    if (!taxonomies.length) {
	    	console.log("empty taxonomy list!")
	      return null;
	    }
        return (
  				<ul className="dropdown-menu">
  				{taxonomies.map((taxonomy, i) => (
		            taxonomy.title!=="PressRelease" ? <li key={i}>
		            	<a href="#" className="small" tabIndex="-1"><input type="checkbox" name={taxonomy.title} id={taxonomy.id ? taxonomy.id.split("-")[1].substring(1,taxonomy.id.split("-")[1].length) : ""} onChange={this._changeHandler}/>&nbsp;{taxonomy.title}</a> 
		            </li> : ""
		          ))}                    
               </ul>
        );        

    }

    _changeHandler(e) {   	
    	//console.log("The checkbox " + e.target.name + " is now " + e.target.checked);    		
	        if (typeof this.props.onChange === 'function') {
	            this.props.onChange(e.target.name, e.target.id, e.target.checked);
	        }
    }  
}