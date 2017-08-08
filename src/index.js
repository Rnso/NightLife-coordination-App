import React, { Component } from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import * as constants from '../constant.js'
import App from './component/App'

render(<App />, document.getElementById('app'))
