import prisma from '../../prisma/client.js';

async function checkDuplicateUrl(videoUrl) {
	const existingVideo = await prisma.video_assignment.findFirst({
		where: { videoUrl },
	});
	return existingVideo !== null;
}

async function getAllVideos() {
	return await prisma.video_assignment.findMany({
		select: {
			id: true,
			videoUrl: true,
			titulo: true,
			professor: true,
			duracao: true,
			categoria: true,
			descricao: true,
			thumbnail: true,
			videoId: true,
		},
	});
}

async function getVideoById(video_id) {
	try {
		const video = await prisma.video_assignment.findUnique({
			where: { id: video_id },
			select: {
				id: true,
				videoUrl: true,
				titulo: true,
				professor: true,
				duracao: true,
				categoria: true,
				descricao: true,
				thumbnail: true,
				videoId: true,
			},
		});
		return video;
	} catch (error) {
		console.log('Error fetching video:', error);
		throw error;
	}
}

async function createVideo(videoData) {
	try {
		// Verifica se já existe um vídeo com a mesma URL
		const isDuplicate = await checkDuplicateUrl(videoData.videoUrl);
		if (isDuplicate) {
			throw { status: 409, message: 'Video with this URL already exists' };
		}

		return await prisma.video_assignment.create({
			data: videoData,
			select: {
				id: true,
				videoUrl: true,
			},
		});
	} catch (error) {
		if (error.status === 409) {
			throw error;
		}
		console.error('Erro detalhado ao criar vídeo:', error);
		throw { 
			status: 500, 
			message: 'Erro ao criar vídeo',
			details: error.message || 'Erro desconhecido'
		};
	}
}

async function updateVideo(video_id, videoData) {
	try {
		// Se estiver atualizando a URL, verifica se já existe outra com a mesma URL
		if (videoData.videoUrl) {
			const existingVideo = await prisma.video_assignment.findFirst({
				where: {
					videoUrl: videoData.videoUrl,
					id: { not: video_id } // Exclui o próprio vídeo da verificação
				}
			});
			if (existingVideo) {
				throw { status: 409, message: 'Já existe um vídeo com esta URL' };
			}
		}

		const updatedVideo = await prisma.video_assignment.update({
			where: { id: video_id },
			data: videoData,
			select: {
				id: true,
				videoUrl: true, 
			},
		});
		return updatedVideo;
	} catch (error) {
		if (error.status === 409) {
			throw error;
		}
		if (error.code === 'P2025') {
			throw { status: 404, message: 'Vídeo não encontrado' };
		}
		console.error('Error updating video:', error);
		throw { status: 500, message: 'Erro ao atualizar vídeo' };
	}
}

async function deleteVideo(id) {
	try {
		const deletedVideo = await prisma.video_assignment.delete({
			where: { id: id },
		});
		return deletedVideo;
	} catch (error) {
		if (error.code === 'P2025') {
			throw { status: 404, message: 'Vídeo não encontrado' };
		}
		console.error('Error deleting video:', error);
		throw { status: 500, message: 'Erro ao deletar vídeo' };
	}
}

export {
	getAllVideos,
	getVideoById,
	createVideo,
	updateVideo,
	deleteVideo,
};
