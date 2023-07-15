<template>
	<div ref="modalElement" class="modal fade" @click="close" id="exampleModal" tabindex="0" aria-labelledby="exampleModalLabel" aria-hidden="true" @keyup.enter="hideModal">
		<div class="modal-dialog">
			<div class="modal-content bg-dark text-white rounded-5 shadow">
				<div class="modal-header" :class="headerClass">
					<h5 class="modal-title" id="exampleModalLabel">{{ modalTitle }}</h5>
					<button type="button" class="btn-close" @click="close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-icon pt-3 text-center">
					<font-awesome-icon :icon="icon" shake size="2xl" :style="{ color: headerColor }" />
				</div>
				<div class="modal-body">
					{{ message }}
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-secondary" @click="close" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { Modal } from 'bootstrap';


type BootstrapModal = InstanceType<typeof Modal>

export default defineComponent({
	name: 'CustomModal',
	props: {
		message: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		}
	},
	emits: ['show', 'closeModal'],
	setup(props, { emit }) {
		const modalElement = ref<HTMLElement | null>(null);
		let bootstrapModal: BootstrapModal | null = null;

		onMounted(() => {
			bootstrapModal = new Modal(modalElement.value);
		});

		const hideModal = () => {
				bootstrapModal?.hide();
		};

		const showModal = () => {
			bootstrapModal?.show();
		};

		const close = () => {
			console.log('close');
			emit('closeModal');
		};

		// watch(() => props.message, (newValue) => {
		// 	if (newValue) {
		// 		bootstrapModal?.show();
		// 	}
		// });

		const headerClass = computed(() => {
			switch (props.type) {
				case 'error':
					return 'bg-danger text-white';
				case 'warning':
					return 'bg-warning text-dark';
				case 'info':
					return 'bg-info text-white';
				case 'success':
					return 'bg-success text-white';
				default:
					return 'bg-dark text-white';
			}
		});

		const modalTitle = computed(() => {
			switch (props.type) {
				case 'error':
					return 'Error';
				case 'warning':
					return 'Warning';
				case 'info':
					return 'Information';
				case 'success':
					return 'Success';
				default:
					return 'Notification';
			}
		});

		const icon = computed(() => {
			switch (props.type) {
				case 'error':
					return 'fa-solid fa-exclamation-circle';
				case 'warning':
					return 'fa-solid fa-exclamation-triangle';
				case 'info':
					return 'fa-solid fa-info-circle';
				case 'success':
					return 'fa-solid fa-check-circle';
				default:
					return 'fa-solid fa-info-circle';
			}
		});

		const headerColor = computed(() => {
			switch (props.type) {
				case 'error':
					return '#dc3545';
				case 'warning':
					return '#ffc107';
				case 'info':
					return '#17a2b8';
				case 'success':
					return '#28a745';
				default:
					return '#6c757d';
			}
		});

		return {
			modalElement,
			hideModal,
			showModal,
			headerClass,
			modalTitle,
			icon,
			headerColor,
			close
		}
	},
});
</script>