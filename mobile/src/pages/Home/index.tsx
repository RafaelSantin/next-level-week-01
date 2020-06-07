import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, Text, View, Image } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

interface IIbgeUfResponse {
    sigla: string;
}

interface IIbgeCityResponse {
    nome: string;
}

interface IPickerSelect {
    label: string,
    value: string
}

const Home = () => {    

    const navigation = useNavigation();

    const [ufs, setUfs] = useState<IPickerSelect[]>([]);
    const [cities, setCities] = useState<IPickerSelect[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedUf, setSelectedUf] = useState('0');

    function handleNavigateToPoints(){
        navigation.navigate('Points', {
            uf: selectedUf,
            city: selectedCity
        });
    }

    useEffect(()=>{
        axios.get<IIbgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map((uf) =>  {
                return{
                    label: uf.sigla,
                    value: uf.sigla
                }
            });
            setUfs(ufInitials);
        })
    },[])

    useEffect(()=>{
        axios.get<IIbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cities = response.data.map(city => {
                return {
                    label:city.nome,
                    value: city.nome
                }
            });
            setCities(cities);
        })
    },[selectedUf])

    return (
        <ImageBackground source={require('../../assets/home-background.png')} imageStyle={{width: 274, height: 368}} style={styles.container}>
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marktplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
            </View>

            <View style={styles.footer}>                
                <RNPickerSelect style={pickerSelectStyles} onValueChange={(value) => setSelectedUf(value)} items={ufs} />
                <RNPickerSelect style={pickerSelectStyles} onValueChange={(value) => setSelectedCity(value)} items={cities} />

                <RectButton style={styles.button} onPress={handleNavigateToPoints}> 
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" size={24} />
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View>
        </ImageBackground> 
    )
}

export default Home;

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: 'purple',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},


    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});