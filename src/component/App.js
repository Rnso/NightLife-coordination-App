import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'
import * as constants from '../../constant.js'
import { API_KEY_GEOCODE, API_KEY_PLACE, CLIENT_ID } from '../../config.js'
import axios from 'axios'
import '../app.css'
import blur from '../img/hangout.jpg'

class App extends Component {
    constructor() {
        super()
        this.state = { showprofile: false }
        this.state.username = ''
        this.state.location = ''
        this.state.placedetails = []
        this.state.showplaces = false
        this.state.isloggedin = false
        this.searchPlaces = this.searchPlaces.bind(this)
        this.getPlaces = this.getPlaces.bind(this)
        this.showLoginModal = this.showLoginModal.bind(this)
        this.logInWithGoogle = this.logInWithGoogle.bind(this)
        this.changeProfile = this.changeProfile.bind(this)
        this.logoutWithGoogle = this.logoutWithGoogle.bind(this)
        this.handleCheckIn = this.handleCheckIn.bind(this)
        this.handleCheckOut = this.handleCheckOut.bind(this)
    }
    componentDidMount() {
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: CLIENT_ID
            })
        })
    }
    searchPlaces() {
        let address = this.refs.search.value
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY_GEOCODE}`)
            .then(res => {
                //console.log(res)
                this.state.location = res.data.results[0].geometry.location
                this.getPlaces()
            })
            .catch(console.error)
    }
    getPlaces() {
        let lat = this.state.location.lat
        let lon = this.state.location.lng
        let radius = 1000
        axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=restaurant&key=${API_KEY_PLACE}`)
            .then(res => {
                this.setState({ placedetails: res.data.results.sort() })
                console.log(res.data.results)
                let checkins = {}
                let checked = {}
                this.state.placedetails.map(place => {
                    checkins[place.id] = 0
                    checked[`checkedin${place.id}`] = false
                })
                this.setState(checkins)
                this.setState(checked)
                this.setState({ showplaces: true })
            })
            .catch(console.error)
    }
    showLoginModal() {
        $('#myModal').modal('show')
    }
    logInWithGoogle() {
        let GoogleAuth = gapi.auth2.getAuthInstance()
        GoogleAuth.signIn()
            .then(GoogleUser => {
                this.changeProfile(GoogleUser)
                axios.get(constants.serverUrl + `/api/getallhangouts/${this.state.username}`)
                    .then(res => {
                        //console.log(res)
                        if (res.data.length > 0) {
                            res.data.map(item => {
                                let checkins = {}
                                let checked = {}
                                this.state.placedetails.forEach((place, i) => {
                                    if (item.id === place.id) {
                                        axios.get(constants.serverUrl + `/api/getallcheckin/${item.id}`)
                                            .then(response => {
                                                checkins[place.id] = response.data.length
                                                checked[`checkedin${place.id}`] = true
                                                this.setState(checkins)
                                                this.setState(checked)
                                            })
                                    }
                                    else {
                                        checkins[place.id] = 0
                                        checked[`checkedin${place.id}`] = false
                                        this.setState(checkins)
                                        this.setState(checked)
                                    }
                                })
                            })
                        }
                    })
                    .catch(console.error)
            })
    }
    changeProfile(GoogleUser) {
        if (GoogleUser) {
            var profile = GoogleUser.getBasicProfile()
            this.setState({ username: profile.getName() })
            this.setState({ showprofile: true })
            this.setState({ isloggedin: true })
            $('#myModal').modal('hide')
        }
        else {
            this.setState({ showprofile: false })
            this.setState({ isloggedin: false })
        }
    }
    logoutWithGoogle() {
        var GoogleAuth = gapi.auth2.getAuthInstance()
        GoogleAuth.signOut()
            .then(GoogleUser => {
                this.changeProfile(GoogleUser)
            })
    }
    handleCheckIn(e) {
        let user = this.state.username
        let id = e.target.id
        axios.post(constants.serverUrl + `/api/checkin`, { user, id })
            .then(res => {
                let checkins = {}
                let checked = {}
                checkins[id] = res.data.length
                checked[`checkedin${id}`] = true
                this.setState(checkins)
                this.setState(checked)
            })
            .catch(console.error)
    }
    handleCheckOut(e) {
        let user = this.state.username
        let id = e.target.id
        axios.post(constants.serverUrl + `/api/checkout`, { user, id })
            .then(res => {
                let checkins = {}
                let checked = {}
                checkins[id] = res.data.length
                checked[`checkedin${id}`] = false
                this.setState(checkins)
                this.setState(checked)
            })
            .catch(console.error)
    }
    render() {
        return (
            <div className='text-center'>
                {this.state.showprofile ? <div>
                    <div className='profile'>
                        <h4>
                            <span>Hello&nbsp;{this.state.username}</span>&nbsp;&nbsp;&nbsp;
                            <span><i className="fa fa-sign-out" onClick={this.logoutWithGoogle}><strong>Sign Out</strong></i></span>
                        </h4>
                    </div>
                </div> : ''}
                <div style={{ background: `url(${blur}) no-repeat center fixed` , clear: 'both'}}>
                    <h1 className='text'>Locate and checkIn your hangout places for the night</h1>
                    <div className='icons'>
                        <i className="fa fa-map-marker"></i>&nbsp;<i className="fa fa-car"></i>&nbsp;<i className="fa fa-glass"></i>&nbsp;<i className="fa fa-cutlery"></i>
                    </div>
                </div>
                <div className='place_holder'>
                    <div className='container place_holder'>
                        <br />
                        <div className="input-group">
                            <input type="text" className="form-control search" placeholder="Enter any country or city" ref="search" />
                            <div className="input-group-btn">
                                <button className="btn btn-primary btn-lg" onClick={this.searchPlaces}><i className="fa fa-search"></i></button>
                            </div>
                        </div>
                        <div>
                            {this.state.showplaces ? <div>
                                {this.state.placedetails.map((place, i) => {
                                    return <div key={i} className='col-md-12'><br />
                                        <div className='col-md-2 col-md-offset-1'>
                                            {place.photos ? <div>
                                                {place.photos.map((photo,j) => {
                                                    return <img key={j} className='image' src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=180&maxheight=150&photoreference=${photo['photo_reference']}&key=${API_KEY_PLACE}`} alt={place.name} width='180' height='150' />
                                                })}
                                            </div> : ''}
                                        </div>
                                        <div className='col-md-8'>
                                            <ul className='ul'><h3>{place.name}</h3>
                                                <li>rating : &nbsp;{place.rating}</li>
                                                <li>{place.vicinity}</li><br />
                                                {this.state.isloggedin ?
                                                    <li>
                                                        {this.state[`checkedin${place.id}`] ? <button id={place.id} className="btn btn-success" onClick={this.handleCheckOut}>Check-Out</button> :
                                                            <button id={place.id} className="btn btn-primary" onClick={this.handleCheckIn}>Check-In</button>
                                                        }
                                                        &nbsp;&nbsp;&nbsp;<button className='btn btn-primary' >Total checkedIn:&nbsp;{this.state[place.id]} </button>
                                                    </li> :
                                                    <li><button className="btn btn-primary" onClick={this.showLoginModal}>Check-In</button></li>
                                                }
                                            </ul><hr />
                                        </div>
                                    </div>
                                })}
                            </div> : ''}
                        </div>
                    </div><br/>
                </div>
                <div id="myModal" className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="btn-group"><br />
                                    <h4>Please sign in</h4><br />
                                    <button className="btn btn-default google_btn"><i className='fa fa-google google'></i></button>
                                    <button className="btn btn-primary" onClick={this.logInWithGoogle}>Sign in with Google</button><br /><br />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
export default App