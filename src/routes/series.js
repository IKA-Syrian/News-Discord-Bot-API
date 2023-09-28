require('dotenv').config()
const router = require('express').Router();
const { getBotGuilds } = require("../utils/api")
const User = require("../database/schema/User")
const { getMutualGuilds } = require("../utils/utils")
const mysql = require("mysql2")
const con = require("../database/bookmark-sql")
const fetch = require("node-fetch")
const axios = require("axios")
const discord = require('discord.js')

const client = new discord.Client({ fetchAllMembers: true })

const token = process.env.DASHBOARD_BOT_TOKEN
const PORT = process.env.PORT || 3002;

client.login(token)

router.get('/', async (req, res) => {
    const id = req.query.id
    console.log(id)
    const result = await con.promise().query(`SELECT * FROM works WHERE manga_id = ${id}`)
    if (result[0][0] == null) {
        res.sendStatus(404)
    } else {
        res.status(200).send(result[0][0])
    }
})

router.post('/new', async (req, res) => {
    if (req.query.id) {

        var control = 0
        const result = await axios.get(`http://localhost:3001/api/series?id=${req.query.id}`, {
            withCredentials: true,
        }).catch(err => {
            console.log(err.response.status)
            control = 1

        })
        if (control == 0) {
            const status = result.request.res.statusCode
            console.log(status)
            if (status == 200) {
                res.status(409).send({ msg: "Already exists" })
            }
        } else if (control == 1) {
            console.log("Error")
            const response = await fetch(`https://api.golden-manga.com/api/mangas/${req.query.id}`)
            const json = await response.json()
            console.log(json.mangaData.title)
            const channel = client.channels.cache.get("988225004619575326");

            const Embed = new discord.MessageEmbed()
            Embed.setTitle("**عمل جديد يضاف للموقع**")

            var categoriesName = []
            if (json.mangaData.categories.length == 0) {
                categoriesName[0] = "لا يوجد"
            } else {
                for (let i = 0; i < json.mangaData.categories.length; i++) {

                    if (i === 0) {
                        categoriesName[i] = `${json.mangaData.categories[i].name}`
                    } else {
                        categoriesName[i] = `${json.mangaData.categories[i].name}`
                    }
                }
            }
            console.log(categoriesName)
            const categorieName = categoriesName.toString().replace(/,/g, "، ")
            Embed.addFields([{
                name: "**• - - - - - - - اسم العمل - - - - - - - •**",
                value: json.mangaData.title
            }, {
                name: "**• - - - - - - - نوع العمل - - - - - - - •**",
                value: `${json.mangaData.type.title} ${json.mangaData.type.name}`
            }, {
                name: "**• - - - - - - - تصنيفات العمل - - - - - - - •**",
                value: categorieName
            }, {
                name: "**• - - - - - - - قصة العمل - - - - - - - •**",
                value: json.mangaData.summary
            }, {
                name: "**• - - - - - - - رابط العمل - - - - - - - •**",
                value: `[لزيارة صفحة العمل من هنا](https://golden-manga.com/mangas/${req.query.id})`
            }])

            Embed.setImage(`https://golden-manga.com/uploads/manga/cover/${json.mangaData.id}/${json.mangaData.cover}`)
            Embed.setColor("#FFD700")
            Embed.setTimestamp()
            Embed.setFooter("Golden Manga", "https://golden-manga.com/assets/product/goldenManga/logo.png")

            channel.send(Embed)
            const result = await con.promise().query('INSERT INTO works (`manga_id`, `name`) VALUES (?, ?)', [json.mangaData.id, json.mangaData.title])

            res.status(200).send({
                msg: "Successfully added"
            })
            res.end()
        }

    }
})

module.exports = router;