import React ,{ useState, useEffect } from 'react';
import Constants from 'expo-constants'
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location'
import RNPickerSelect from 'react-native-picker-select'

import { SvgUri } from 'react-native-svg'

import MapView, { Marker } from 'react-native-maps';
import api from '../../services/api';

interface IItems {
    id: number,
    title: string,
    image_url: string
}

interface IPoints {
    id: number,
    name: string,
    image: string,
    image_url: string,
    latitude: number,
    longetude: number

}

interface IParams {
    uf: string,
    city: string
}



const Points = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const [items, setItems] = useState<IItems[]>([]);    
    const [points, setPoints] = useState<IPoints[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);

    const routeParam = route.params as IParams; 

    useEffect(()=>{
        api.get('items').then((response) => {
            setItems(response.data)
        })
    }, []);

    useEffect(() => {
        async function loadPosition() {
            const  { status } = await Location.requestPermissionsAsync();

            if( status !== 'granted')
            {
                Alert.alert('Ooooops...', 'Precisamos de sua permissão para obter a localização');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude} = location.coords;

            setInitialPosition([
                latitude,
                longitude
            ])

        }

        loadPosition();
    },[])

    useEffect(() => {
        api.get('points', {
            params:{
                city: routeParam.city,
                uf: routeParam.uf,
                items:selectedItems
            }
        }).then(response => {
            setPoints(response.data);
        })
    }, [selectedItems])

    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detail',{ pointId: id})
    }

    function handleSelectedItems(id: number) {
        const exist = selectedItems.findIndex(item => item === id);

        if(exist >= 0)
        {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    { initialPosition[0] !== 0 && (
                        <MapView  loadingEnabled={initialPosition[0] === 0} initialRegion={{latitude: initialPosition[0], longitude:initialPosition[1], latitudeDelta: 0.014, longitudeDelta:0.014}} style={styles.map}>
                            {points.map(point => (
                                <Marker key={point.id} coordinate={{latitude:point.latitude, longitude:point.longetude}} style={styles.mapMarker} onPress={() => handleNavigateToDetail(point.id)}>
                                    <View style={styles.mapMarkerContainer}>
                                        <Image 
                                            source={{uri: point.image_url}} 
                                            style={styles.mapMarkerImage}
                                        />
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer }>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20}}>
                    {items.map(item => (
                        <TouchableOpacity activeOpacity={0.7} key={item.id} style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]} onPress={ () => handleSelectedItems(item.id)}>
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>  
                    ))}                
                </ScrollView>
            </View>
        </>
    )
}

export default Points;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});