import React from 'react';
import jQuery from 'jquery';
import SearchBox from './search-box'
import Taxonomies from './taxonomies'
import PressReleases from './press-releases'
import SortOrderDropdown from './sort-order-dropdown'
import InfiniteScroll from './InfiniteScroll'

export default class SearchForm extends React.Component {
	constructor() {
    super();
	 //templateId on master=9871
   //templateId on aws dev=3844
    this.state = {
      taxonomies: [],
      selectedTaxonomies: [],
      pressReleases: [],
      pressReleasesBackup:[],
      sortOrder: "CREATION_DATE Descending",
	  sortStatus:"",
	  publicationId:9,
      schemaId: 97,
      templateId: 1527,
      siteUrl:"http://holdings.sdldemo.com/",
      dateRange: "",
      start: "2000-01-01T04:36:12+05:30",
      end: moment().format(),
      hasMore: true,
      pageSize: 10,
      startPage: 0,
      loaderText: "Loading...",
      resetInfiniteScroll: false,
      searchTerm: "",
	  lastNode:"",
	  categoryId:1140,
	  keywordId:0, //15269
	  defaultKeywordId:0
    };    

    this._changeHandler = this._changeHandler.bind(this)  
    //this._taxonomiesDropdownClickHandler = this._taxonomiesDropdownClickHandler.bind(this);
    this._sortOrderDropdownChangeHandler = this._sortOrderDropdownChangeHandler.bind(this)
    this._searchBoxChangeHandler = this._searchBoxChangeHandler.bind(this)
    this._searchBoxClickHandler = this._searchBoxClickHandler.bind(this)
	this.onScroll = this.onScroll.bind(this);
  }

	componentWillMount() {
	  	this._fetchTaxonomies()
	  	this._fetchPressReleases()
  } 

  componentDidMount(){
      const start = moment().subtract(29, 'days');
      const end = moment();
      
      $('input[name="daterange"]').daterangepicker({
        "applyClass": "btn-primary",
        "alwaysShowCalendars": true,
        autoUpdateInput: false,
        locale: {
          cancelLabel: 'Clear'
        },
        startDate: start,
            endDate: end,
            ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               'Last 7 Days': [moment().subtract(6, 'days'), moment()],
               'Last 30 Days': [moment().subtract(29, 'days'), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
           
        }
      }, this.cb.bind(this));

      //initialize date picker with e.g. last 30 days
      //cb(start, end);

      $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
      });

      $('input[name="daterange"]').on('cancel.daterangepicker', function() {
        $(this).val('');
      });
	  window.addEventListener('scroll', this.onScroll, false);
  }
	onScroll() {
		if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)) {
			if(this.state.pressReleases.length!==0){
				this.state.lastNode= this.state.pressReleases[this.state.pressReleases.length-1].cursor
			}
		}
	}
  _getRandomKey(){
    return (Math.floor(Math.random() * (5000 - 1)) + 1)
  }

  cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        console.log("daterangepicker callback:" + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        this.setState({
          start: moment(start, 'YYYY-MM-DD HH:mm').format(),
          end: moment(end, 'YYYY-MM-DD HH:mm').format(), 
          dateRange: start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY')
        });
		console.log(moment(start, 'YYYY-MM-DD HH:mm').format());
        this.setState({ pressReleases: [], resetInfiniteScroll: true })         
        this._fetchPressReleases(0)
        this.setState( {resetInfiniteScroll: false, key: this._getRandomKey() } )
  }

  _searchBoxClickHandler(searchKeyword){    
    console.log(" _searchBoxClickHandlersearchKeyword=" + searchKeyword)    

    this.setState({ pressReleases: [], resetInfiniteScroll: true, searchTerm: searchKeyword})    
    this._fetchPressReleases(0, searchKeyword)
    this.setState( {resetInfiniteScroll: false, key: this._getRandomKey() } )
  }

  _searchBoxChangeHandler(searchKeyword){
    if(!searchKeyword)
      {
		 this.setState({ pressReleases: [] })
       //this.setState({ pressReleases: this.state.pressReleasesBackup})
	   this._fetchPressReleases(0)
      }else{
        const pressReleases = this.state.pressReleases.filter(pressRelease => pressRelease.node.component.title.toLowerCase().indexOf(searchKeyword) > -1)
        this.setState({ pressReleases })
      }
  }

  /*_taxonomiesDropdownClickHandler(){
      //enable to display new taxonomies on the fly. however it alters performance, since it adds many queries
      //alternatively add a timer to call this every x seconds      
      this._fetchTaxonomies()
  }*/

  _changeHandler(title, taxId, selected){ 
	this.state.lastNode = ""
  	const taxonomy= {
  		id: taxId,
  		title: title
  	}

  	if(selected){ 
  		this.state.selectedTaxonomies.push(taxonomy)
		this.state.keywordId = parseInt(taxId)		
  	}else{			      
		    const NewTaxonomies = this.state.selectedTaxonomies.filter(taxonomy => taxonomy.id !== taxId);
			this.state.selectedTaxonomies = NewTaxonomies;
			this.state.keywordId = this.state.defaultKeywordId;
    }	  
    this.setState({ pressReleases: [], resetInfiniteScroll: true}) 
	this.state.lastNode = "";
	this.state.hasMore = true;
	this._fetchPressReleases(0)   

	this.setState( {resetInfiniteScroll: false, key: this._getRandomKey() } )
  }

  _sortOrderDropdownChangeHandler(sortOrder){   
      this.state.sortOrder = sortOrder;
	  //if(this.state.sortStatus===""){
		this.state.lastNode = "";
	  //}
	  //this.state.sortStatus = sortOrder;
	  this.state.hasMore = true;
      this.setState({ pressReleases: [], resetInfiniteScroll: true, hasMore:true}, this._fetchPressReleases(0)) 
      
      this.setState( {resetInfiniteScroll: false, key: this._getRandomKey() } )  
  }

	_fetchTaxonomies() {
		var query = `query sitemapSubtree($namespaceId: Int!, $publicationId: Int!, $taxonomyNodeId: String){
				  sitemapSubtree(namespaceId: $namespaceId, publicationId: $publicationId, taxonomyNodeId:$taxonomyNodeId) {
					description
					id
					items {
					  ... on SitemapItem {
						originalTitle
						id
						title
					  }
					}
				  }
}`
		jQuery.ajax({
			method: 'POST',			
			data: JSON.stringify({ 
				query:	query, 
						variables:{
							"namespaceId": 1,
							"publicationId": 9,//this.props.pubId,
							"taxonomyNodeId": "t1140" //"t"+this.state.categoryId.toString(),							
						}
					}),
			url:`http://tridion.sdldemo.com:8081/cd/api`,
			contentType: "application/json",
			success: (taxonomies) => {
				
				this.setState({ taxonomies:taxonomies.data.sitemapSubtree[0].items })
				console.log("retrieved taxonomies ok");
			}, error:(e) => {
				console.log("error: "+e);
			}
		});
	}
	_fetchPressReleases(page = 0, searchKeyword = "") {      
		if(!this.state.hasMore){
			return;
		}
		const selectedTaxonomyIds = this.state.selectedTaxonomies.map(taxonomy => taxonomy.id)
		console.log("current pagination = " + page);

		//set search term from state for additional pages
		if(page>0 && searchKeyword === "")
		{
			searchKeyword = this.state.searchTerm
		}		
		//if(this.state.pressReleases.length!==0 || this.state.sortStatus!==""){
			//console.log(this.state.pressReleases[this.state.pressReleases.length-1].cursor);
			//this.state.lastNode= this.state.pressReleases[this.state.pressReleases.length-1].cursor
		//} 
		
		var myjsonObject = {
						"namespaceId": 1,
						"publicationId": 9,
						"filter": {
							"schema": {
								"id": 97
							},
							"template": {
								"id": 1527
							},
							"keyword": {
								"categoryId": this.state.categoryId,
								"keywordId": this.state.keywordId
							},							
						},						
						"sort" : { 
							"sortBy": this.state.sortOrder.split(" ")[0], 
							"order": this.state.sortOrder.split(" ")[1] 
						},
						"first": 10,
						"after": null
					}
					if(myjsonObject.filter.keyword.keywordId==0)
					{
						delete myjsonObject.filter.keyword;
					}
    	// Grpahql Query
		var query = `query
					  componentPresentations($filter:InputComponentPresentationFilter!, $after: String, $first: Int, $namespaceId: Int!, $publicationId: Int!, $sort: InputSortParam){
						componentPresentations(after: $after, first: $first, namespaceId: $namespaceId, publicationId: $publicationId, filter: $filter, sort:$sort) {
						  edges {
							node {
							  component {
								title,
								itemId         
							  },
							  rawContent
							  {
								data
							  }
							}
						  }
						}
					  }`
					  
					  
    jQuery.ajax({
		method: 'POST',
		data: JSON.stringify({ 
			query: 	query,
					variables: myjsonObject
				}),
		contentType: "application/json",
		//url: `${location.origin}:8083/cd/api`,
		url:`http://tridion.sdldemo.com:8081/cd/api`,
		success: (queryResult) => {
			if(queryResult.data.componentPresentations.edges.length===0){
				this.setState({
					hasMore:false,
					lastNode: ""
				})
				return;
			} else {
				console.log(queryResult);
				if(!this.state.hasMore)
				{
					this.setState({loaderText: ""})
					console.log("No more pages to load.")
					this.setState({ hasMore: true }) 
				}
				
				const pressReleases = []
				if(!queryResult.data.componentPresentations.edges || !queryResult.data.componentPresentations.edges.length)
				{
					console.log("empty result from API") 
					//only empty results if first page is empty. Avoids wiping results on last pagination
					if(page==0)
					{  
						this.setState({ pressReleases })               
					}
				}
				else if(queryResult.data.componentPresentations.edges.length > 0)
				{
					this.setState({ pressReleases: this.state.pressReleases.concat(queryResult.data.componentPresentations.edges), publicationId: this.props.pubId })
					this.setState({ pressReleasesBackup: this.state.pressReleasesBackup.concat(queryResult.data.componentPresentations.edges) })
					console.log("retrieved PRs ok");
				}   
			}
		}
    });
 }
 
 render() {
 
		const loader = <div className="row">
				<div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-3">
					<div className="cssLoader"></div>
					<div className="loadingText">{this.state.loaderText}</div>
				</div>
			</div>;
		return(
			<div className="container">
				<div className="search-form" id="search-form">          	             	
					<SearchBox pressReleases={this.state.pressReleases} onChange={this._searchBoxChangeHandler} onClick={this._searchBoxClickHandler} />      
					 <div className="row">
						<div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-3">
							<button type="button" className="form-control btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" id="Topics" value="Topic">Topic <span className="glyphicon glyphicon-triangle-bottom pull-right" aria-hidden="true"></span></button>	                    
							<Taxonomies taxonomies={this.state.taxonomies} onChange={this._changeHandler} />	                    
						</div>
						<div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-3">
							<input type="text" className="form-control" name="daterange" placeholder="Show press releases from" value={this.state.dateRange} />
						</div>
						<div className="form-group col-xs-12 col-sm-3 col-md-3 col-lg-3 col-md-offset-2 col-sm-offset-2 col-lg-offset-3">
							<SortOrderDropdown onChange={this._sortOrderDropdownChangeHandler} />
						</div>
					</div> 
				</div>
				<div className="search-result">
					<div className="row"> 
						<InfiniteScroll
							key={this.state.key}
							pageStart={0}
							loadMore={this._fetchPressReleases.bind(this)}
							hasMore={false}
							loader={loader}
							useWindow={true}
							threshold={300}
							initialLoad={false}
							resetInfiniteScroll={this.state.resetInfiniteScroll}>

								  <PressReleases pressReleases={this.state.pressReleases} pubid = {9}/>
							  
						</InfiniteScroll>                   
							 
					</div>
				</div>
			</div>
		);
	}
}
