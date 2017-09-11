module.exports = function init(site) {

    site.vars = []
    site.readFile(site.dir + '/json/vars.json' , (err , data)=>{
        if(!err){
            let vars = JSON.parse(data)
            for (let i = 0; i < vars.length; i++) {
                site.vars.push(vars[i])
            }
        }
    })
}