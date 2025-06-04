import {
	getAllVideos,
	getVideoById,
	createVideo,
	updateVideo,
	deleteVideo,
} from '../models/Video.js';
import fetch from 'node-fetch';

async function getAllVideosController(req, res) {
	try {
		const videos = await getAllVideos();
		return res.status(200).json(videos);
	} catch (error) {
		console.error('Erro ao buscar vídeos:', error);
		return res.status(500).json({ message: 'Erro ao buscar vídeos' });
	}
}

async function getVideoByIdController(req, res) {
	try {
		const video = await getVideoById(parseInt(req.params.videoId));

		if (!video) {
			return res.status(404).json({ message: 'Vídeo não encontrado' });
		}

		return res.status(200).json(video);
	} catch (error) {
		console.error('Erro ao buscar vídeo:', error);
		return res.status(500).json({ message: 'Erro ao buscar vídeo' });
	}
}

async function createVideoController(req, res) {
	try {
		const { videoUrl } = req.body;
		if (!videoUrl) {
			return res.status(400).json({ message: 'O campo videoUrl é obrigatório.' });
		}

		// Função para extrair o ID do vídeo do YouTube
		function extractVideoId(url) {
			const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
			const match = url.match(regExp);
			return (match && match[2].length === 11) ? match[2] : null;
		}

		const videoId = extractVideoId(videoUrl);
		if (!videoId) {
			return res.status(400).json({ message: 'URL do YouTube inválida.' });
		}

		const apiKey = process.env.YOUTUBE_API_KEY;
		const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!data.items || data.items.length === 0) {
			return res.status(404).json({ message: 'Vídeo não encontrado na API do YouTube.' });
		}

		const videoInfo = data.items[0];
		const duration = videoInfo.contentDetails.duration;
		const minutes = Math.floor(parseInt(duration.match(/PT(\d+)M/)?.[1] || 0));
		const seconds = parseInt(duration.match(/PT(?:\d+M)?(\d+)S/)?.[1] || 0);

		const videoData = {
			videoUrl,
			titulo: videoInfo.snippet.title,
			professor: videoInfo.snippet.channelTitle,
			duracao: `${minutes}:${seconds.toString().padStart(2, '0')}`,
			categoria: 'YouTube',
			descricao: videoInfo.snippet.description,
			thumbnail: videoInfo.snippet.thumbnails.high.url,
			videoId: videoId
		};

		const video = await createVideo(videoData);
		return res.status(201).json(video);
	} catch (error) {
		console.error('Erro ao criar vídeo:', error);
		return res.status(500).json({ message: 'Erro ao criar vídeo', details: error.message });
	}
}

async function updateVideoController(req, res) {
	try {
		const video = await updateVideo(req.params.videoId, req.body);
		return res.status(200).json(video);
	} catch (error) {
		console.error('Erro ao atualizar vídeo:', error);
		return res.status(500).json({ message: 'Erro ao atualizar vídeo' });
	}
}

async function deleteVideoController(req, res) {
	try {
		const videoId = parseInt(req.params.videoId, 10);
		const video = await deleteVideo(videoId);
		return res.status(200).json(video);
	} catch (error) {
		console.error('Erro ao deletar vídeo:', error);
		return res.status(error.status || 500).json({ message: error.message, details: error.details });
	}
}

export {
	getAllVideosController,
	getVideoByIdController,
	createVideoController,
	updateVideoController,
	deleteVideoController,
};