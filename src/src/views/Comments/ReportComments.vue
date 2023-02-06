<template>
    <div v-if="loading" class="text-center pt-3 pb-3">
        Comments is loading ...
    </div>
    <div v-else>
        <v-card class="mt-4">
            <v-card-text class="grey--text text--darken-2">
                COMMENTS
                <p class="d-inline teal--text font-weight-medium">
                    {{ comments.length }}
                </p>
            </v-card-text>
            <v-divider></v-divider>
            <v-list align-top dense>
                <template v-for="(comment, index) in comments">
                    <v-responsive
                        class="overflow-y-auto"
                        max-height="400"
                        :key="`${index}-responsive`"
                    >
                        <v-lazy
                            v-model="comment.isActive"
                            :options="{ threshold: 0.5 }"
                            min-height="70"
                            transition="fade-transition"
                        >
                            <transition-group>
                                <v-list-item
                                    :key="index"
                                    color="primary"
                                    class="mb-3"
                                    small
                                >
                                    <div>
                                        <div
                                            class="font-weight-normal grey--text text--darken-2"
                                        >
                                            <strong class="d-inline-block"
                                                >@{{ comment.user.firstname }}
                                                {{
                                                    comment.user.lastname
                                                }}</strong
                                            >
                                            &nbsp;
                                            <p
                                                class="d-inline-block fill-height mb-0"
                                                v-html="comment.content"
                                            ></p>
                                        </div>
                                        <div
                                            class="d-inline-block blue-grey--text text-caption"
                                        >
                                            {{ comment.publication_date }}
                                        </div>
                                        <v-btn
                                            text
                                            small
                                            class="d-inline-block blue-grey--text text-caption text-decoration-underline text-capitalize ml-1"
                                            @click="updateComment(comment)"
                                            v-if="
                                                tenMinCheck(comment) &&
                                                user.id === comment.user_id
                                            "
                                        >
                                            Edit
                                        </v-btn>
                                    </div>
                                </v-list-item>
                                <v-divider
                                    v-if="index < comments.length - 1"
                                    :key="`${index}-divider`"
                                    class="mb-2"
                                ></v-divider>
                            </transition-group>
                        </v-lazy>
                    </v-responsive>
                </template>
            </v-list>
            <tiptap-vuetify
                placeholder="Write your comment ..."
                v-model="content"
                :extensions="extensions"
            />
            <v-btn
                @click="sendComment"
                width="100%"
                color="grey lighten-4"
                class="rounded-t-0 teal--text"
            >
                Send
            </v-btn>
        </v-card>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import {
    TiptapVuetify,
    Heading,
    Bold,
    Italic,
    Strike,
    Underline,
    Code,
    Paragraph,
    BulletList,
    OrderedList,
    ListItem,
    Link,
    Blockquote,
    HardBreak,
    HorizontalRule,
    History,
} from 'tiptap-vuetify'

export default {
    name: 'ReportComments',
    computed: {
        comments() {
            return this.$store.state.comments.comments
        },
        user() {
            return this.$store.state.auth.user
        },
    },
    components: { TiptapVuetify },
    data: () => ({
        show: [],
        loading: true,
        extensions: [
            History,
            Blockquote,
            Link,
            Underline,
            Strike,
            Italic,
            ListItem,
            BulletList,
            OrderedList,
            [
                Heading,
                {
                    options: {
                        levels: [1, 2, 3],
                    },
                },
            ],
            Bold,
            Code,
            HorizontalRule,
            Paragraph,
            HardBreak,
        ],
        content: '',
        comment: null,
    }),
    methods: {
        ...mapActions(['GetComments', 'UpdateComment', 'CreateComment']),
        tenMinCheck(comment) {
            return Date.now() - Date.parse(comment.publication_date) <= 600000
        },
        updateComment(comment) {
            this.comment = comment
            this.content = comment.content
        },
        sendComment() {
            this.loading = true
            let nowDate = new Date()
            let year = nowDate.getFullYear()
            let month = nowDate.getMonth() + 1
            let day = nowDate.getDate()
            let hr = nowDate.getHours()
            let min = nowDate.getMinutes()
            let sec = nowDate.getSeconds()
            let newDate =
                year +
                '-' +
                month +
                '-' +
                day +
                ' ' +
                hr +
                ':' +
                min +
                ':' +
                sec
            if (this.comment) {
                const form = {
                    user_id: this.comment.user_id,
                    report_id: this.comment.report_id,
                    content: this.content,
                    publication_date: newDate,
                }
                this.UpdateComment({ form: form, commentId: this.comment.id })
            } else {
                const form = {
                    user_id: this.user.id,
                    report_id: this.$route.params.id,
                    content: this.content,
                    publication_date: newDate,
                }
                this.CreateComment(form)
            }
            this.comment = null
            this.content = ''
            this.GetComments(this.$route.params.id).then(
                () => (this.loading = false)
            )
        },
    },
    created() {
        this.GetComments(this.$route.params.id).then(
            () => (this.loading = false)
        )
    },
}
</script>

<style scoped>
:deep(.tiptap-vuetify-editor .v-card.v-sheet) {
    box-shadow: none;
}
</style>