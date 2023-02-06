import {required, max, regex, min, between, min_value, numeric, ext, size} from 'vee-validate/dist/rules'
import { extend, setInteractionMode } from 'vee-validate'

setInteractionMode('eager')

extend('numeric', {
    ...numeric,
    message: '{_field_} needs to be numeric',
    validate: value => { return !!Number(value)}
})

extend('min_date_value', {
    ...min_value,
    message: 'Date must be greater or equal today',
    validate: value => { return value >= new Date().toISOString().slice(0,10)}
})

extend('between', {
    ...between,
    message: '{_field_} needs to be between {min} and {max}',
})

extend('required', {
    ...required,
    message: '{_field_} can not be empty',
})

extend('max', {
    ...max,
    message: '{_field_} may not be greater than {length} characters',
})

extend('min', {
    ...min,
    message: '{_field_} must be greater than {length} characters',
})

extend('regex', {
    ...regex,
    message: '{_field_} {_value_} is not valid',
})

extend('ext', {
    ...ext,
    message: 'Not valid file extension.',
    validate: (value, extensions) => { return extensions.includes(value.name.split('.').pop())}
})

extend('size', {
    ...size,
    message: 'Maximum allowable file size - {size} MB.',
    validate: (value, params) => {
        const input = document.getElementById('presentation');
        return input.files[0].size <= params.size * 1024 * 1024
    }
})
