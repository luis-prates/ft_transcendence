<template>
    <div ref="modalElement" class="modal fade" id="firstLoginModal" tabindex="-1" aria-labelledby="firstLoginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark text-white rounded-5 shadow">
                <div class="modal-header bg-info">
                    <h5 class="modal-title" id="firstLoginModalLabel">{{ modalTitle }}</h5>
					<!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
					</button> -->
                </div>
				<form @submit.prevent="submit">
					<div class="modal-body">
						<!-- <label for="firstLoginCodeInput">Enter 2FA Code:</label> -->
						<input type="text" id="firstLoginCodeInput" v-model="code" required />
					</div>
					<div class="modal-footer border-top-0 text-white">
						<!-- <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="cancel">Cancel</button> -->
						<button type="button" class="btn btn-primary" @click="submit">Submit</button>
					</div>
				</form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, nextTick } from 'vue';
import { Modal } from 'bootstrap';

type BootstrapModal = InstanceType<typeof Modal>

export default defineComponent({
    name: 'FirstLoginPrompt',
	props: {
		type: {
			type: String,
			required: true
		},
		prefilledCode: {
			type: String,
			required: false
		}
	},
	emits: ['submit'],
    setup(props, { emit }) {
        const code = ref('');
        const modalElement = ref<HTMLElement | null>(null);
        let bootstrapModal: BootstrapModal | null = null;

        onMounted(() => {
            bootstrapModal = new Modal(modalElement.value);
			modalElement.value?.addEventListener('show.bs.modal', () => {
				code.value = props.prefilledCode || '';
			});
        });

        const showModal = () => {
            code.value = props.prefilledCode || '';
            nextTick(() => {
				bootstrapModal?.show();
			});

        };

        const hideModal = () => {
            bootstrapModal?.hide();
        };

        const cancel = () => {
            hideModal();
        };

        const submit = () => {
            // Emit an event with the entered code
            emit('submit', code.value);
            hideModal();
        };

		const modalTitle = computed(() => {
			switch(props.type) {
				case 'nickname':
					return 'Set Nickname';
				case 'picture':
					return 'Set Profile Picture';
				default:
					return 'Set Profile Picture';
			}
		});

        return {
            modalElement,
            showModal,
            cancel,
            submit,
			code,
			modalTitle,
        };
    },
});
</script>
