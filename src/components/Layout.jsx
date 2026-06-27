import React from "react"
import Nav from "./Nav"
import Footer from "./Footer"
import "../styles/global.css"

export default function Layout({ children }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
