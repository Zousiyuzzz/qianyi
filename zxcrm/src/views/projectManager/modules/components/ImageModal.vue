<template>
    <div class="image-modal" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>{{ title }}</h3>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>
            <div class="modal-body">
                <img v-if="imageUrl" :src="imageUrl" :alt="title" class="modal-image" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImageModal',
    props: {
        imageUrl: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: '图片预览'
        }
    }
};
</script>

<style scoped>
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f0f0f0;
}

.modal-body {
    padding: 20px;
    text-align: center;
    max-height: calc(90vh - 100px);
    overflow: auto;
}

.modal-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}
</style>
