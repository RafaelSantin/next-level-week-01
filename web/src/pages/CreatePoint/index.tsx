import React, {useEffect, useState, FormEvent, ChangeEvent} from 'react';
import './style.css';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'

import DropZone from '../../components/dropzone/index';

import logo from '../../assets/logo.svg';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';


//array ou objeto: manualmente informar o tipo da variavel

interface IItem {
    title: string,
    id: number,
    image_url: string
}

interface IIbgeUfResponse {
    sigla: string;
}

interface IIbgeCityResponse {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<IItem[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        number: ''
    })

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
        })
    })

    useEffect(() => {
        api.get('items').then((response => {
            setItems(response.data);
        }))
    }, []);

    useEffect(()=>{
        axios.get<IIbgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, [])

    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }

        axios.get<IIbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cities = response.data.map(city => city.nome);
            setCities(cities);
        });

    }, [selectedUf]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        setSelectedUf(event.target.value)
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent)
    {
        setSelectedPosition([event.latlng.lat, event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({ ...formData, [name]: value })
    }

    function handleSelectItem(id: number){

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0)
        {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([ ...selectedItems, id ]);
        }

    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const { name, number, whatsapp, email} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name',name);
        data.append('number',number);
        data.append('whatsapp',whatsapp);
        data.append('email',email);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longetude',String(longitude));
        data.append('items',items.join(','));

        if(selectedFile)
        {
            data.append('image', selectedFile);
        }

        await api.post('points',data).then((response)=>{
            alert('ponto de coleta criado');
        })
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de coleta</h1>
                <DropZone onFileUploaded={setSelectedFile} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            onChange={handleInputChange}
                            id="name" />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleInputChange}
                                id="email" />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                onChange={handleInputChange}
                                id="whatsapp" />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereco no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}></Marker>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="number">Numero</label>
                            <input
                                type="text"
                                name="number"
                                onChange={handleInputChange}
                                id="number" />
                        </div>
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" 
                                    id="uf"                                     
                                    value={selectedUf} 
                                    onChange={handleSelectedUf} >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option value={uf} key={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" 
                                id="city" 
                                onChange={handleSelectedCity}
                                value={selectedCity}>
                            <option value="0">Selecione uma Cidade</option>
                            {cities.map(city=>(
                                <option key={city} value={city}>{city}</option> 
                            ))}
                        </select>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}  onClick={() => handleSelectItem(item.id)}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
};

export default CreatePoint;