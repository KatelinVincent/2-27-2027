module.exports = {
  pathPrefix: "/2-27-2027",
  siteMetadata: {
    title: "Jacob & Kate Nemeth",
    description: "Join us as we become the Nemeths — February 27, 2027, Texas Hill Country.",
    siteUrl: "https://your-domain-here.com",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-fonts",
      options: {
        fonts: [
          "Cormorant Garamond:300,300i,400,400i,600",
          "Jost:300,400",
          "Great Vibes",
        ],
        display: "swap",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`,
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "The Nemeths — Wedding 2027",
        short_name: "The Nemeths",
        start_url: "/",
        background_color: "#F9F5EE",
        theme_color: "#7A8C6E",
        display: "standalone",
        icon: "src/images/icon.png", // add a small N monogram or ring icon here
      },
    },
  ],
}
