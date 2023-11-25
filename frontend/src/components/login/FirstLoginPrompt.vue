<template>
    <div ref="modalElement" class="modal fade" id="firstLoginModal" tabindex="-1" aria-labelledby="firstLoginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark text-white rounded-5 shadow">
                <div class="modal-header bg-info">
                    <h5 class="modal-title" id="firstLoginModalLabel">{{ modalTitle }}</h5>
                </div>
				<form @submit.prevent="submit">
					<div class="modal-body">
						<input v-if="$props.type === 'picture'" type="file" id="firstLoginCodeInput" class="form-control" accept="image/*" @change="handlePictureChange" required />
						<img v-if="profilePicURL" :src="profilePicURL" alt="Selected image" class="img-fluid mx-auto d-block mt-3" style="max-width: 400px; max-height: 400px;"/>
						<input v-if="$props.type === 'nickname'" type="text" id="firstLoginCodeInput" v-model="code" required />
						<div v-if="errorMessage" class="invalid-feedback d-block">{{ errorMessage }}</div>
					</div>
						<div class="modal-footer border-top-0 text-white">
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
		},
		errorMessage: {
			type: String,
			default: ''
		}
	},
	emits: ['submit'],
    setup(props, { emit }) {
        const code = ref<any>('');
        const modalElement = ref<HTMLElement | null>(null);
        let bootstrapModal: BootstrapModal | null = null;
		const profilePicBase64 = ref('');
		const profilePicURL = ref('');

		onMounted(() => {
			if (modalElement.value) {
				bootstrapModal = new Modal(modalElement.value, {
					backdrop: 'static',
					keyboard: false,
				});
			}
			modalElement.value?.addEventListener('show.bs.modal', () => {
				code.value = props.prefilledCode || '';
				if (props.type === 'picture' && props.prefilledCode) {
					setupReceivedPicture(new URL(props.prefilledCode));
				}
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
			if (props.type === 'picture') {
				const payload = { type: props.type, content: profilePicBase64.value }
				emit('submit', payload);
				if (profilePicURL.value)
					URL.revokeObjectURL(profilePicURL.value);
				// Emit an event with the entered code
			} else {
            	emit('submit', { type: props.type, content: code.value });
			}
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

		async function urlToFile(url: URL, filename: string, mimeType: string) {
			const res = await fetch(url);
			const blob = await res.blob();
			const file = new File([blob], filename, {type: mimeType});
			return file;
		}

		// Handle avatar file change
		const setupReceivedPicture = (imagePath: URL) => {
			urlToFile(imagePath, 'image.jpg', 'image/jpg')
			.then(file => {
				// You now have a File object you can work with
				convertFileToBase64(file)
				.then((base64String) => {
					profilePicBase64.value = base64String;
					profilePicURL.value = URL.createObjectURL(file);
				})
				.catch((error) => {
					console.error("Error converting file to base64:", error);
				});
				//console.log(file);
			})
			.catch(console.error);
		};

		// Handle avatar file change
		const handlePictureChange = (event: Event) => {
			const fileInput = event.target as HTMLInputElement;
			const file = fileInput.files?.[0];

			if (file) {
				convertFileToBase64(file)
				.then((base64String) => {
					profilePicBase64.value = base64String;
					profilePicURL.value = URL.createObjectURL(file);
				})
				.catch((error) => {
					console.error("Error converting file to base64:", error);
				});
			}
		};

		// Convert file to base64 string
		const convertFileToBase64 = (file: File): Promise<string> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = () => {
					if (typeof reader.result === "string") {
						resolve(reader.result);
					} else {
						reject(new Error("Invalid file type"));
					}	
				};

				reader.onerror = (error) => {
					reject(error);
				};

				reader.readAsDataURL(file);
			});
		};


        return {
            modalElement,
            showModal,
            cancel,
            submit,
			code,
			modalTitle,
			profilePicBase64,
			profilePicURL,
			handlePictureChange,
			errosMessage: props.errorMessage,
        };
    },
});
</script>
