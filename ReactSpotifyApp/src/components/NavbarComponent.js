import React, { useState, Component, useContext, useEffect } from 'react'
import { Context } from '../store/appContext';
import {Navbar,Nav, NavDropdown, Form, FormControl, Button} from 'react-bootstrap'
import { redirect } from 'react-router-dom';
import { Navigate, Link } from 'react-router-dom';



export const NavbarComponent = () => {
  const { store, actions} = useContext(Context);
  const token = sessionStorage.getItem("token")
  const username = sessionStorage.getItem("username")
  const [refresh, setRefresh] = useState("");

  useEffect(() => {
    setRefresh("2")
  },[store.username,store.token])

  const handleClick = (e) => {
    actions.logout().then(() => {
      if (store.token == null) {
        return <Navigate to="/" replace />
      }
    })
    
  }

  if (token && username) {
    return (
      <Navbar expand="lg" variant="dark" className="color-nav">
            <Navbar.Brand href="#home"></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav variant="pills" defaultActiveKey="/home" className="me-auto">
                <Nav.Link variant="info" eventKey="link-1" href="/">Home</Nav.Link>
                <Nav.Link href="/playlists">View Playlists</Nav.Link>
                <Nav.Link href="/add">Add Playlists</Nav.Link>
              </Nav>
              <Nav className="ms-auto">
                <NavDropdown title={username}> 
                <NavDropdown.Item href="/myAccount"> My Account</NavDropdown.Item>
                </NavDropdown>
                <Button variant="info" onClick={handleClick}>Logout</Button>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
  } else {
    return (
      <Navbar expand="lg" variant="dark" className="color-nav">
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav variant="pills" defaultActiveKey="/home" className="me-auto">
              <Nav.Link variant="info" eventKey="link-1" href="/">Home</Nav.Link>
              <Nav.Link href="/playlists">View Playlists</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
            <Link to ="/createAccount">
              <Button variant="info mr-2">Create Account</Button>
              </Link>
              <Link to="/login">
              <Button variant="info mr-5">Login</Button>
              </Link>
            </Nav>
          </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default NavbarComponent