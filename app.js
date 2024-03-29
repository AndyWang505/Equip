const express = require("express");
const fetch = require("node-fetch");
const app = express();
// cors
const cors = require("cors");
// Server running on port: http://localhost:5000/
const POST = process.env.PORT || 5000;
app.listen(POST, () => {
    console.log(`Server running on port: http://localhost:${POST}/`);
});

app.use(
    cors({
        origin: "*"
    })
);

app.get("/", async function(req,res){
    try{
        const itemList = await getItemList;
        res.send(itemList);
    }catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error!!");
    }
});

// main
let version = 249;
let apiUrl = `https://maplestory.io/api/TWMS/${version}/item/`;
// let imgUrl = `https://maplestory.io/api/TWMS/${version}/item/${value}/icon`;

let result = [];
let resultId = [];
let getItemList = [];


fetch(apiUrl,{})
    .then((res) => {
        return res.json();
    }).then((data) => {
        result = data.forEach( value => {
            const substrings = ['頂級培羅德', '天上的氣息', '神秘冥界', '創世', '苦痛', '巨大的恐怖', '口紅控制', '滅龍騎士',
                                 '附有魔力', '魔性', '米特拉的憤怒', '女武神之心', '鈦之心', '妖精之心', '機器心臟', '航海師'];
            const regex = new RegExp(substrings.join('|'), 'g');
            function compareStr(str){
                if (str.match(regex)){
                    return true;
                }else return false;
            }
            if ((value.name && compareStr(value.name)) 
                && value.isCash === false && value.typeInfo.overallCategory !== 'Etc' && value.typeInfo.overallCategory !== 'Use' && value.typeInfo.subCategory !== 'Pet Food' && value.typeInfo.subCategory !== 'Zero'){
                    // if repeat then ignore
                    if (!(value.name in result)) {
                        resultId.push(value.id);
                        result[value.name] = true;
                    }
            }
        });
        console.log(resultId.length);
        // let item = data.find(element => element.name == 'XXX');
        // console.log(item);
        findIdItem();
    }).catch((err) => {
        console.log(err);
    });


    
async function findIdItem(){
    try {
        const promises = resultId.map(async (value) => {
            const res = await fetch(`https://maplestory.io/api/TWMS/${version}/item/${value}/`, {});
            const data = await res.json();
            return data;
        });
        // ensure that all Promise are functioning properly
        const results = await Promise.all(promises);
        getItemList = results.map(function(item){
            // remove frameBooks, frameBooksPerWeaponType, mob ...
            const { frameBooks, frameBooksPerWeaponType, mob, ...rest } = item;
            delete rest.metaInfo.iconRawOrigin;
            delete rest.metaInfo.iconOrigin;
            delete rest.metaInfo.mob;
            delete rest.metaInfo.iconRaw;
            delete rest.metaInfo.icon;
            delete rest.metaInfo.vslots;
            delete rest.metaInfo.islots;
            delete rest.metaInfo.charmEXP;
            delete rest.metaInfo.tradeAvailable;
            delete rest.metaInfo.setCompleteCount;
            delete rest.metaInfo.bossReward;
            return { ...rest };
        });
        console.log('update...');
    } catch (err) {
        console.log("findIdItem function error!! " + err);
    };
};

findIdItem();
setInterval(function(){ findIdItem(); },140000);