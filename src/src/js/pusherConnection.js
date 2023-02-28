import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Pusher.logToConsole = true;

window.Pusher = Pusher

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.VUE_APP_PUSHER_APP_KEY,
    cluster: process.env.VUE_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
})
