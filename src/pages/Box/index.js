import React, { Component } from 'react';
import api from '../../services/api';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';
import { MdInsertDriveFile } from 'react-icons/md';
import socket from 'socket.io-client';
import logo from '../../assets/logo.svg';
import './styles.css';

export default class Box extends Component {

    state = {
        box:{}
    }

    async componentDidMount(){
        this.subscribeToNewFiles();
        const box = this.props.match.params.id;
        const response = await api.get(`boxes/${box}`);
        console.log(response.data);
        this.setState({ box: response.data });
    }

    subscribeToNewFiles = () => {
        const box = this.props.match.params.id;
        const url = api.defaults.baseURL;
        const io = socket(url);
        io.emit('connectRoom', box);
        
        io.on('file', data => {
            this.setState({ box: { ...this.state.box, files: [ data, ...this.state.box.files ] } });
        });
    }

    handleUpload = async (files) =>{
        const box = this.props.match.params.id;
        files.forEach(async (file) => {
            try{
                const data = new FormData();
                data.append('file', file);
                await api.post(`boxes/${box}/files`, data);
            }catch(err){
                console.error(err);
            }
        });
    }

    render() {
        return (
            <div id="box-container">
                <header>
                    <img src={logo} />
                    <h1>{ this.state.box.title }</h1>
                </header>
                <Dropzone onDropAccepted={ this.handleUpload }>
                    {({ getRootProps, getInputProps }) => (
                        <div className="upload" { ...getRootProps() }>
                            <input { ...getInputProps() } />
                            <p>Arraste arquivos ou clique aqui!</p>
                        </div>
                    )}
                </Dropzone>
                <ul>
                    { this.state.box.files && this.state.box.files.map(file => (
                        <li key={file._id}>
                            <a className="fileInfo" href={ file.url } target="_blank">
                                <MdInsertDriveFile size={24} color="#A5CFFF" />
                                <strong>{ file.title }</strong>
                            </a>
                            <span>há { distanceInWords(file.createdAt, new Date(), {
                                locale: pt
                            }) }</span>
                        </li>
                    )) }
                </ul>
            </div>
        );
    }
}