import React from "react"
import Layout from "../components/Layout"
import Hero from "../components/Hero"
import Story from "../components/Story"
import Photos from "../components/Photos"
import AisleGame from "../components/AisleGame"
import Details from "../components/Details"
import Registry from "../components/Registry"

export default function IndexPage() {
  return (
    <Layout>
      <Hero />
      <Story />
      <Photos />
      <AisleGame />
      <Details />
      <Registry />
    </Layout>
  )
}

export function Head() {
  return (
    <>
      <title>Jacob & Kate Nemeth — February 27, 2027</title>
      <meta name="description" content="Join us as we become the Nemeths. February 27, 2027 · Texas Hill Country." />
      <meta property="og:title" content="Jacob & Kate Nemeth" />
      <meta property="og:description" content="Becoming the Nemeths — February 27, 2027 · Texas Hill Country." />
    </>
  )
}
