exports = module.exports = setOptions


function setOptions(options) {

    const AllOptions = Object.assign({
        port : process.env.port || 80,
        dir : './site_files',
        savingTime : 60,
        session : {
            timeout : 60 * 24 * 30 ,
            enabled : true,
            storage : 'mongodb',
            dbName : 'sessions' ,
            userSessionCollection : 'user_sessions'
        },
        mongodb : {
            enabled : true,
            url :'127.0.0.1',
            port : '27017',
            userName : null,
            password : null,
            prefix : {
                db:'',
                collection:''
            }
        },
        security :{
            enabled : true,
            dbName : 'security',
            userCollection :'users',
            admin:{
                email : 'admin@localhost',
                password : 'admin'
            },
            users:[]
        },
        cache:{
            enabled : true,
            js : 60 * 24 * 30,
            css : 60 * 24 * 30,
            fonts : 60 * 24 * 30,
            images : 60 * 24 * 30,
            json : 60 * 24 * 30,
            xml : 60 * 24 * 30,
        }

    } , options )

    return AllOptions
}