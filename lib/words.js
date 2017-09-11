module.exports = function init(site) {

    site.words = []
    site.readFile(site.dir + '/json/words.json' , (err , data)=>{
        if(!err){
            site.words = JSON.parse(data)
        }
    })
}