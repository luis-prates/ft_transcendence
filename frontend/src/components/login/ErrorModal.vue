<template>
	<div ref="modalElement" class="modal fade" id="exampleModal" tabindex="0" aria-labelledby="exampleModalLabel" aria-hidden="true" @keyup.enter="hideModal">
		<div class="modal-dialog">
			<div class="modal-content bg-dark text-white rounded-5 shadow">
				<div class="modal-header bg-danger text-white ">
					<h5 class="modal-title" id="exampleModalLabel">Login Error</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-icon pt-3 text-center">
					<font-awesome-icon icon="fa-solid fa-warning" shake size="2xl" style="color: #dc3545" />
				</div>
				<div class="modal-body">
					{{ errorMessage }}
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { Modal } from 'bootstrap';


type BootstrapModal = InstanceType<typeof Modal>

export default defineComponent({
	name: 'ErrorModal',
	props: {
		errorMessage: {
			type: String,
			required: true
		}
	},
	emits: ['show'],
	setup(props, { emit }) {
		const modalElement = ref<HTMLElement | null>(null);
		let bootstrapModal: BootstrapModal | null = null;

		onMounted(() => {
			bootstrapModal = new Modal(modalElement.value);
		});

		const hideModal = () => {
			if (bootstrapModal)
				bootstrapModal.hide();
		};

		watch(() => props.errorMessage, (newValue) => {
			if (newValue && bootstrapModal) {
				bootstrapModal.show();
			}
		});

		const showModal = () => {
			bootstrapModal?.show();
		};

		return {
			modalElement,
			hideModal,
			showModal,
		}
	},
});
</script>