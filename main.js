const Discord = require('discord.js')
const clinet = new Discord.Client(({
    presence: { activity: { name: '!pomoc', type: 'PLAYING' }, status: 'online' }
}))

const ytdl = require('ytdl-core');

const { YTSearcher } = require('ytsearcher');

const searcher = new YTSearcher({
    key: "AIzaSyD2Rm7P2DH0FUxFseuxz_T8ECLAbjja17U",
    revealed: true
});

const activator = "!"

clinet.on("Reday", () => {
    console.log("Im online!")
})

const queue = new Map();


clinet.on('message', message=>{
    const args = message.content.slice(activator.length).split(/ +/)
    const command = args.shift().toLowerCase()

    if(command === 'ahoj'){
        message.channel.send("Zdar!")
    } else if(command == 'mic'){
        message.channel.send("Basketbalovy mic")
    } else if(command == 'pomoc'){
        let Pomoc = new Discord.MessageEmbed()
        .setTitle('Pomoc')
        .setDescription('Tohle je pomoc!\n'
        + ' prikazy!')
        .addFields(
            {name: '!ahoj', value: 'Bot napise zdar!'},
            {name: '!mic', value: 'Bot napise typy micu!'}
        )
        message.author.send(Pomoc)
    } 
})






clinet.on("message", message => {


    const serverQueue = queue.get(message.guild.id);


    const args = message.content.slice(activator.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    switch(command){
        case 'play':
            execute(message, serverQueue);
            break;
        case 'stop':
            stop(message, serverQueue);
            break;
        case 'skip':
            skip(message, serverQueue);
            break;
        case 'pause':
            pause(serverQueue);
            break;
        case 'resume':
            resume(serverQueue);
            break;
    }


    async function execute(message, serverQueue){
        let vc = message.member.voice.channel;
        if(!vc){
            return message.channel.send("První jse napoj do voice chatu :)")
        }else{
            let result = await searcher.search(args.join(" "), { type: "video" })
            const songInfo = await ytdl.getInfo(result.first.url)

            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };

            if(!serverQueue){
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 10,
                    playing: true
                };
                queue.set(message.guild.id, queueConstructor);

                queueConstructor.songs.push(song);

                try{
                    let connection = await vc.join();
                    queueConstructor.connection = connection;
                    play(message.guild, queueConstructor.songs[0]);
                }catch (err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`Unable to join the voice chat ${err}`)
                }
            }else{
                serverQueue.songs.push(song);
                return message.channel.send(`Pisnička byla přidaná ${song.url}`);
            }
        }
    }
    function play(guild, song){
        const serverQueue = queue.get(guild.id);
        if(!song){
            queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () =>{
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            serverQueue.txtChannel.send(`Spustil jsi ${serverQueue.songs[0].url}`)
           
    }
    function stop (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first!");
            serverQueue.txtChannel.send(`Tak příště zase, ahooj!`)
            
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        serverQueue.vChannel.leave()
    }
    function skip (message, serverQueue){
        if(!serverQueue)
            return message.channel.send("Není co přeskočit :)");
            serverQueue.txtChannel.send(`Přeskocil jsi písničku!`)
        serverQueue.connection.dispatcher.end();
    }
})







































clinet.login('ODQzODQ3MzI4NDE3ODQxMTYz.YKJ0EQ.17F19sGdCeaRZAxlP_c2UtkzPE4')