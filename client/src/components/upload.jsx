import React, { Component } from 'react';
import UploadForm from './uploadform.jsx';
import Worthymap from './worthymap.jsx';
import DropZone from './dropzone.jsx';
import { Grid, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';


/*
 * This top-level component contains the entire upload page, including the map, photo dropzone and
 * upload form subcomponents.
 * 
 * We keep track of the information that the user wants to upload in this component's state, and
 * bind all the methods tracking the state to this component, so that we can add that information 
 * within other components.
 */

export default class Upload extends Component {
  constructor(props) {
    
    super(props)
    
    this.state = {
      category: '',
      location: '',
      imageURL: '',
      description: '',
      user_id: '',
      username: '',
      submitted: '',
      loading: false,
      latLng: {lat: null, lng: null},
      uploadStatus: [],
      tags: ''
      // tags: [
      //   { id: "Outdoors", text: "Outdoors"},
      // ],
      // suggestions: [
      //   { id: "Maryland", text: "Maryland"},
      //   { id: "California", text: "California"},
      //   { id: "Napa", text: "Napa"}
      // ]
    };

    /*
     * Bind and define methods that track the state change of this component within other components.
     */

    this.getLink = this.getLink.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.pinLocation = this.pinLocation.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  setLocation(latLng) {
    this.setState({
      latLng: {
        lat: latLng.latitude,
        lng: latLng.longitude
      }
    });
  }

  getLink(imgurLink) {
    this.setState({ imageURL: imgurLink })
  }

  pinLocation({ latLng }) {
    
    this.setState({
      latLng: {
        lat: latLng.lat(),
        lng: latLng.lng(),
      }
    })
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  /*
   * Method checks whether any fields are empty, and then if all required information is present,
   * submits post request using axios.
   */

  handleSubmit(event) {
    event.preventDefault();

    const inputFields = (({category, location, description, imageURL, latLng}) => ({category: category, location: location, description: description, imageURL: imageURL, latLng: latLng, description: description, imageURL: imageURL, latLng: latLng}))(this.state);
    let invalidFields = [];

    for (const pair in inputFields) {
      pair === 'latLng'
        ? inputFields[pair].lat === null || inputFields[pair].lng === null ? invalidFields.push('Your photo does not contain location data. Please drop a location pin on the map') : null
        : inputFields[pair] === '' ? invalidFields.push(`Please enter a valid ${pair}`) : null;
    }
    
    // // if (category === '') {
    // //   invalidFields.push('Please enter a category');
    // // } 
    // // if (location === '') {
    // //   invalidFields.push('Please enter a location');
    // // }
    // // if (latLng.lat === null || latLng.lng === null) {
    // //   invalidFields.push('Please drop pin on location on the map');
    // // }
    // // if (description === '') {
    // //   invalidFields.push('Please enter a description');
    // // }
    // // if (imageURL === '') {
    // //   invalidFields.push('Please upload a image')
    // // }
    if (invalidFields.length > 0) {
      this.setState({uploadStatus: invalidFields});
      return;
    } else {
      this.setState({uploadStatus: []})
    }
    inputFields.user_id = this.props.userData._id;
    inputFields.username = this.props.userData.username;
    inputFields.tags = this.state.tags.split(', '); //store tags as an array
    
    
    this.setState({
      loading: true
    })

    axios.post(`/api/upload`, inputFields)
    
      .then(res => {
        this.setState({
          submitted: 'Successfully uploaded!',
          loading: false
        });
      })
    
      .then(() => {
        this.setState({
          category: '',
          description: '',
          imageURL: '',
          location: '',
          latLng: {
            lat: null,
            lng: null
          },
          tags: '' // reset state of tags
        });
      })
      
      .then(() => {
        setTimeout(() => this.setState({submitted: ''}), 2000);
      })
      
      .catch((err) => {
        this.setState({
          submitted: 'An error occurred. Please try again.',
          loading: false
        })
      })
  }

  handleAddition (tag) {
    const { tags } = this.state;
    this.setState({ tags: [...tags, ...[tag]] })
  }

  handleDelete (i) {
    let tags = this.state.tags.filter((tag, index) => index !== i);
    this.setState({ tags: tags});
  }

  handleDrag(tag, currentPosition, newPosition) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currentPosition, 1);
    newTags.splice(newPosition, 0, tag);

    this.setState({ tags: newTags });
  }
  /*
   * Renders the entire upload page, including the map, the photo upload dropzone and
   * the upload form.
   */

  render() {
    const { lat, lng } = this.state.latLng;
    const marker = [lat, lng].includes(null) 
      ? [] 
      : [{lat, lng}]
    
    
    return (
      <Grid style={{minHeight: `calc(100vh - 130px)`}}>
        
        <Row style={{padding: `50px`}}>
          <Col xs={9} md={4} style={{height: `400px`}}> 
            <Worthymap 
              getLocationUpload={this.getLocationUpload}
              onMapClick={this.pinLocation}
              defaultZoom={10}
              defaultCenter={{lat: 37.77, lng: -122.41}}
              markers={ marker }
            />
          </Col>
          
          <Col xs={6} md={4}>
            <DropZone getLink={this.getLink} setLocation={this.setLocation}/>
          </Col>
          
          <Col xs={6} md={4}>
            <UploadForm
              category={this.state.category}
              location={this.state.location}
              imageURL={this.state.imageURL}
              description={this.state.description}
              handleInputChange={this.handleInputChange}
              handleSubmit={this.handleSubmit}
              uploadStatus={this.state.uploadStatus}
              handleAddition={this.handleAddition}
              handleDelete={this.handleDelete}
              handleDrag={this.handleDrag}
              suggestions={this.state.suggestions}
              tags={this.state.tags}
            />
            <br />
            
            <div style={{width: `100px`, margin: `auto`, position: `relative`, top:`80px`}}>
              <BeatLoader color={`#919295`} loading={this.state.loading} />
            </div>
            <div style={{textAlign: `center`, fontWeight: `bold`, fontSize: `large`, position: `relative`, top:`80px`}}>
              {this.state.submitted}
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
}

