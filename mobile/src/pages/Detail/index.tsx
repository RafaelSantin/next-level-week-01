import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, SafeAreaView, Linking } from 'react-native';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler'
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer';

interface IParams {
    pointId: number
}

interface IData {
    point: {
        name: string,
        id: string,
        image: string,
        image_url: string,
        whatsapp: string,
        email: string,
        city: string,
        uf: string,
        number: number
    };
    items: {
        title: string
    }[];
}

const Detail = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [data, setData] = useState<IData>({} as IData);

    const routeParams = route.params as IParams;

    useEffect(() => {
        //  console.log(routeParams);
        api.get(`points/${routeParams.pointId}`).then(response => {
            setData(response.data);
        })
    }, [])

    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleMailCompose() {
        console.log(data.point.email);
        MailComposer.composeAsync({
            subject: 'Interesse na coleta de residuos',
            recipients: [data.point.email]
        });
    }

    function handleWhatsapp(){
        Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse sobre pontos de coleta.`)
    }

    if (!data.point) {
        return null;
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Image style={styles.pointImage} source={{ uri: data.point.image_url }}></Image>
                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>{data.items.map(item => item.title).join(', ')}</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereco</Text>
                    <Text style={styles.addressContent}>{data.point.city} ,{data.point.uf} , numero: {data.point.number}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleWhatsapp}>
                    <FontAwesome name="whatsapp" size={20} color="#FFF"></FontAwesome>
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={handleMailCompose}>
                    <Icon name="mail" size={20} color="#FFF"></Icon>
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </>
    )
}

export default Detail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    pointImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
        borderRadius: 10,
        marginTop: 32,
    },

    pointName: {
        color: '#322153',
        fontSize: 28,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    pointItems: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    address: {
        marginTop: 32,
    },

    addressTitle: {
        color: '#322153',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '48%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto_500Medium',
    },
});