import React from 'react';
import moment from 'moment';

export default class PressReleases extends React.Component {	
	constructor() {
		super();
		this.state = {
			pageLink : "#"
		}
		this._getDetailsPressReleases = this._getDetailsPressReleases.bind(this)
	}
	
	_getDetailsPressReleases(event){
		event.preventDefault();
		console.log(this.props.pubid);
		const compId = event.target.dataset.componentid;
		var queryy = `query componentLink($namespaceId: Int!, $publicationId: Int!, $sourcePageId: Int, $targetComponentId: Int!, $excludeComponentTemplateId: Int, $renderRelativeLink: Boolean){
			componentLink(namespaceId: $namespaceId, publicationId: $publicationId, sourcePageId: $sourcePageId, targetComponentId: $targetComponentId, excludeComponentTemplateId: $excludeComponentTemplateId, renderRelativeLink: $renderRelativeLink) 
			{
				url
			}
		}`
		jQuery.ajax({
			method:"POST",
			data : JSON.stringify({ query: queryy, variables: {"namespaceId":1, "publicationId": this.props.pubid, "targetComponentId": compId, "renderRelativeLink": false }}),
			contentType: "application/json",
			url: `${location.origin}:8083/cd/api`,
			success: (responseData) => {
				console.log("Page Link: "+responseData.data.componentLink.url);
				this.setState({
					pageLink: responseData.data.componentLink.url
				})
				window.location = responseData.data.componentLink.url;
			}
		})		
	}
	
    render() { 

    	const { pressReleases = [] } = this.props;   
	    if (!pressReleases.length) {
	    	//console.log("empty PR list!");
	      	return (<div className="col-md-12" id="searchResults">
	      				<h3 style={{paddingBottom:10}}>No results</h3>
	      		  </div>
	      	);	      		
	    }		 
	    
        return (
        	<div className="col-xs-12 col-md-12" id="searchResults">      		
        		{pressReleases.map((pressRelease, i) => (  
        			<div className="col-xs-12 col-md-12 well well-lg pull-left" key={i}>
						<div>
						{/*pressRelease.node.rawContent.data.Component.MetadataFields.classification.KeywordValues.map((classificationTit) => (classificationTit.Description) ) */}
						</div>						
		                <span><i className="fa fa-calendar" aria-hidden="true"></i> {/*moment(pressRelease.node.rawContent.data.Component.MetadataFields.standardMeta.EmbeddedValues[0].dateCreated.DateTimeValues[0]).format('MMMM Do YYYY')*/} &nbsp;</span>						
		                <h2><a href={!this.state.pageLink?'#':this.state.pageLink} data-componentid = {pressRelease.node.component.itemId} onClick={this._getDetailsPressReleases}>{pressRelease.node.rawContent.data.Content.headline}</a></h2>
		                <p className="lead">{pressRelease.node.rawContent.data.Content.content}</p>		                
		            </div>	            
	            ))} 
            </div>
        );    	
    }

}