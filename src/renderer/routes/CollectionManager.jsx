import CollectionAPI from 'renderer/api/CollectionAPI';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import ImageSelector from 'renderer/components/ImageSelector';

export default () => {
    const { game } = useParams();
    const [newCollectionName, setNewCollectionName] = useState('');
    const [videos, setVideos] = useState([]);
    const [collections, setCollections] = useState({ _originals: [] });
    const [selected, setSelected] = useState(null);
    const [previewImageBase64, setPreviewImageBase64] = useState(null);
    const [editingMetaData, setEditingMetaData] = useState(false);

    useEffect(() => {
        loadData();
    }, [game, selected]);

    const loadData = async () => {
        const collectionMap = await window.api.send('getCollections', game);
        const videoList = await window.api.send('getVideos', game);
        setCollections(collectionMap);
        setVideos(videoList);

        if (selected) {
            const previewImage = await CollectionAPI.getPreviewImage(
                selected,
                game
            );
            console.log(JSON.stringify(previewImage));
            console.log(previewImage.imageUrl);
            setPreviewImageBase64(previewImage.imageUrl);
        }
    };

    const deleteCollection = async (collectionId, deleteFiles = false) => {
        const collectionMap = await CollectionAPI.deleteCollection(
            collectionId,
            game,
            deleteFiles
        );
        setCollections(collectionMap);
        toast('Deleted clip pack!', { type: 'info' });
    };

    const launch = async (except) => {
        const gameId = game === 'rifftrax' ? '1707870' : '1495860';
        await window.api.send('disableVideos', { game, except });
        window.open(`steam://run/${gameId}`);
    };

    const importZip = async () => {
        toast('Importing clip pack...', { type: 'info' });
        const collectionMap = await window.api.send('importZip', game);
        if (!collectionMap) {
            return;
        }
        setCollections(collectionMap);
        toast('Imported new clip pack!', { type: 'info' });
    };

    return (
        <div>
            <h2>Pack Manager ({game})</h2>
            <h3>Actions</h3>
            <button
                type="button"
                onClick={() => {
                    importZip();
                }}
            >
                Install Clip Pack
            </button>
            <h3>Clip Packs</h3>
            <table style={{ margin: 'auto' }}>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'left' }}>
                            <b>Originals</b> (
                            {
                                videos.filter(
                                    (video) => !video._id.startsWith('_')
                                ).length
                            }{' '}
                            videos)
                        </td>
                        <td>
                            <button
                                onClick={() => {
                                    launch(
                                        videos
                                            .filter(
                                                (video) =>
                                                    !video._id.startsWith('_')
                                            )
                                            .map((video) => video._id)
                                    );
                                }}
                            >
                                Launch
                            </button>
                        </td>
                    </tr>
                    {Object.keys(collections).map((key) => {
                        return (
                            <tr key={key}>
                                <td style={{ textAlign: 'left' }}>
                                    <b>{key}</b> ({collections[key].length}{' '}
                                    videos)
                                </td>
                                <td>
                                    <button
                                        onClick={() => {
                                            launch(collections[key]);
                                        }}
                                    >
                                        Launch
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            deleteCollection(key, true);
                                        }}
                                    >
                                        Uninstall Clip Pack
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
