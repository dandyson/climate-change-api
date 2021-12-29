// DEPENDENCIES
const express = require("express")
const axios = require("axios")
const cheerio = require("cheerio")
const nodemon = require("nodemon")

// PORT
const PORT = process.env.port || 8000

const app = express()

const newspapers = [
  {
    name: "theguardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
    base: 'https://www.theguardian.com/'
  },
  {
    name: "thetelegraph",
    address: "https://www.telegraph.co.uk/climate-change/",
    base: 'https://www.telegraph.co.uk/'
  },
  {
    name: "theindependent",
    address: "https://www.independent.co.uk/climate-change",
    base: 'https://www.independent.co.uk/'
  },
]

// ARTICLES ARRAY
const articles = []

newspapers.forEach(paper => {
    axios
    .get(paper.address)
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)

      $('a:contains("climate")', html).each(function () {
          const title = $(this).text()
          const url = $(this).attr('href')

          articles.push({
              title,
              url: paper.base + url,
              source: paper.name
          })
      })

    })
    .catch((error) => {
      console.log(error)
    })
})

app.get("/news", function (req, res) {
  res.json(articles)
})

app.get('/news/:newspaperID', async (req, res) => {
    const newspaperId = req.params.newspaperID;
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address

    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        })
})

app.listen(process.env.PORT || 5000)
