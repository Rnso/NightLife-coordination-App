import React, { Component } from 'react'
import * as constants from '../../constant.js'
import { API_KEY_CODE } from '../../constant'
import axios from 'axios'
import '../app.css'

class App extends Component {
    constructor() {
        super()
        this.state = {}
        this.state.username = (typeof sessionStorage["name"] != "undefined") ? sessionStorage.name : ''
        this.state.location = ''
        this.more_places = []
        this.state.placedetails = (typeof sessionStorage["places"] != "undefined") ? JSON.parse(sessionStorage.places) : []
        this.state.isnotfound = false
        this.state.showplaces = (typeof sessionStorage["active"] != "undefined") ? JSON.parse(sessionStorage.active) : false
        this.state.isloggedin = (typeof sessionStorage["active"] != "undefined") ? JSON.parse(sessionStorage.active) : false
        this.state.showmore = false
        this.searchPlaces = this.searchPlaces.bind(this)
        this.getPlaces = this.getPlaces.bind(this)
        this.showLoginModal = this.showLoginModal.bind(this)
        this.logInWithGoogle = this.logInWithGoogle.bind(this)
        this.changeProfile = this.changeProfile.bind(this)
        this.logoutWithGoogle = this.logoutWithGoogle.bind(this)
        this.handleCheckIn = this.handleCheckIn.bind(this)
        this.handleCheckOut = this.handleCheckOut.bind(this)
        this.getCheckedinDetails = this.getCheckedinDetails.bind(this)
        //this.searchPlaces()
    }
    componentDidMount() {
        if (this.state.username)
            this.getCheckedinDetails()
    }
    searchPlaces(e) {
        e.preventDefault()
        this.more_places = []
        if (typeof sessionStorage["searchInput"] == "undefined") sessionStorage.searchInput = ""
        this.refs.search.value = this.refs.search.value || sessionStorage.searchInput
        let address = this.refs.search.value || sessionStorage.searchInput
        sessionStorage.searchInput = address
        if (address !== "") {
            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY_CODE}`)
                .then(res => {
                    this.state.location = res.data.results[0].geometry.location
                    this.getPlaces()
                })
                .catch(console.error)
        }
    }
    getPlaces() {
        let loc = this.state.location
        let map = new google.maps.Map(document.createElement('div'))
        var service = new google.maps.places.PlacesService(map)
        service.nearbySearch({
            location: loc,
            radius: 1000,
            type: ['restaurant']
        }, (res, status, pagination) => {
            if (status === 'ZERO_RESULTS') {
                this.setState({ isnotfound: true })
            }
            else {
                this.setState({ isnotfound: false })
            }
            if (status === 'OK') {
                res.map(place => {
                    let obj = {}
                    obj.id = place.place_id
                    obj.name = place.name
                    obj.rating = place.rating
                    obj.vicinity = place.vicinity
                    if (place.photos) {
                        place.photos.map(photo => {
                            obj.photo = photo.getUrl({ 'maxWidth': 180, 'maxHeight': 150 })
                        })
                    }
                    this.more_places.push(obj)
                })
                this.setState({ placedetails: this.more_places })
                sessionStorage.places = JSON.stringify(this.state.placedetails)
                let checkins = {}
                let checked = {}
                this.state.placedetails.map(place => {
                    checkins[place.id] = 0
                    checked[`checkedin${place.id}`] = false
                })
                this.setState(checkins)
                this.setState(checked)
                this.setState({ showplaces: true })
            }
            if (pagination.hasNextPage) {
                this.setState({ showmore: true })
                let el = document.getElementById('more_btn')
                el.addEventListener('click', () => {
                    pagination.nextPage()
                    this.setState({ showmore: false })
                })
            }
        })
    }
    showLoginModal() {
        $('#myModal').modal('show')
    }
    logInWithGoogle() {
        let GoogleAuth = gapi.auth2.getAuthInstance()
        GoogleAuth.signIn()
            .then(GoogleUser => {
                this.changeProfile(GoogleUser)
                this.getCheckedinDetails()

            })
    }
    changeProfile(GoogleUser) {
        if (GoogleUser) {
            var profile = GoogleUser.getBasicProfile()
            this.setState({ username: profile.getName() })
            this.setState({ isloggedin: true })
            sessionStorage.active = true
            sessionStorage.name = this.state.username
            $('#myModal').modal('hide')
        }
        else {
            sessionStorage.active = false
            sessionStorage.name = ''
            sessionStorage.searchInput = ''
            sessionStorage.places = []
            this.setState({ isloggedin: false })
        }
    }
    getCheckedinDetails() {
        axios.get(constants.serverUrl + `/api/getallhangouts`)
            .then(res => {
                if (res.data.length > 0) {
                    res.data.map(item => {
                        let checkins = {}
                        let checked = {}
                        this.state.placedetails.forEach((place, i) => {
                            if (item.id === place.id) {
                                axios.get(constants.serverUrl + `/api/getallcheckin/${item.id}`)
                                    .then(response => {
                                        if (item.user == this.state.username) {
                                            checkins[place.id] = response.data.length
                                            checked[`checkedin${place.id}`] = true
                                            this.setState(checkins)
                                            this.setState(checked)
                                        }
                                        else {
                                            checkins[place.id] = response.data.length
                                            this.setState(checkins)
                                        }
                                    })
                            }
                        })
                    })
                }
            })
            .catch(console.error)
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
                {this.state.isloggedin ? <div>
                    <div className='profile'>
                        <h4>
                            <span>Hello&nbsp;{this.state.username}</span>&nbsp;&nbsp;&nbsp;
                            <span><i className="fa fa-sign-out" onClick={this.logoutWithGoogle}><strong>Sign Out</strong></i></span>
                        </h4>
                    </div>
                </div> : ''}
                <div style={{ clear: 'both' }}>
                    <h1 className='text'>Locate and checkIn your hangout places for the night</h1>
                    <div className='icons'>
                        <i className="fa fa-map-marker"></i>&nbsp;<i className="fa fa-car"></i>&nbsp;<i className="fa fa-glass"></i>&nbsp;<i className="fa fa-cutlery"></i>
                    </div>
                </div>
                <div className='place_holder'>
                    <div className='container place_holder'>
                        <br />
                        <form onSubmit={this.searchPlaces}>
                            <div className="input-group">
                                <input type="text" className="form-control search" placeholder="Enter any country or city" ref="search" />
                                <div className="input-group-btn">
                                    <button className="btn btn-primary btn-lg" type='submit'><i className="fa fa-search"></i></button>
                                </div>
                            </div >
                        </form><br />
                        {this.state.isnotfound ? <div className='no_result'> No Results found</div> : ''}
                        <div>
                            {this.state.showplaces ? <div>
                                {this.state.placedetails.map((place, i) => {
                                    return <div key={i} className='col-md-12 border'><br />
                                        <div className='col-md-2 col-md-offset-1'>
                                            <img className='image' src={place.photo} alt={place.name} width='180' height='150' />
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
                                            </ul>
                                        </div>
                                    </div>
                                })}
                                <div className='text-center'>
                                    {this.state.showmore ? <button id='more_btn' className='btn btn-primary btn-block'><strong>More ...</strong></button> : ''}
                                </div>
                            </div> : ''}
                        </div>
                    </div><br />
                </div>
                <div id="myModal" className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="btn-group"><br />
                                    <h4>Please sign in with google account</h4><br />
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