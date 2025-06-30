import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {get} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfessionalCard = ({professional}: any) => (
  <Card style={styles.card}>
    <Card.Content style={styles.cardContent}>
      <Image source={{uri: professional.image}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{professional.name}</Text>
        <View style={styles.location}>
          <Icon name="location-on" size={16} color="#000" />
          <Text style={styles.locationText}>{professional.location}</Text>
        </View>
        <Text style={styles.bio}>
          {professional.bio}
          <Text style={styles.more}>{professional.more}</Text>
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.outlinedButton]}
            onPress={() => {}}>
            <Text style={styles.outlinedButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.containedButton]}
            onPress={() => {}}>
            <Text style={styles.containedButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card.Content>
  </Card>
);

const FindingUsers = ({route, navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);
  const {leadId} = route.params;

  useEffect(() => {
    fetchToken();
    setTimeout(() => {
      setShowLoading(false);
      fetchUsers();
    }, 1000);
  }, [showLoading]);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await get(
          `quiz/get-results/${leadId}?page=${page}&limit=50`,
          {},
          token,
        );
        setUsers(data?.matchedProviders || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, leadId],
  );

  const loadingImage = require('../../../assets/community/loadingAnimation.gif');
  if (loading || showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={loadingImage} style={styles.loadingImage} />
        <Text style={styles.loadingTitle}>
          Finding best professionals for you
        </Text>
        <Text style={styles.loadingsubTitle}>
          Connecting you with best professionals in industry{'\n'}in few
          seconds...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {users.length > 0 ? (
          users.map((professional: any) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))
        ) : (
          <View style={styles.nocontainer}>
            <View style={styles.noResultsContainer}>
              <Image
                source={require('../../../assets/quiz/noProfessionalFound.png')}
                style={styles.noResultPlaceholder}
              />
              <Text style={styles.noResultsText}>No Professionals found</Text>
              <Text style={styles.nosubText}>No Professionals found</Text>
              <TouchableOpacity
                style={styles.findMore}
                onPress={() => {
                  navigation.navigate('BottomBar');
                }}>
                <Text style={styles.findMoreText}>
                  Explore More Professionals
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      {users.length > 0 ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => {}}>
            <Text style={styles.seeAllButtonText}>See All Professionals</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  loadingImage: {
    borderRadius: 70,
    width: 110,
    height: 110,
  },
  loadingTitle: {
    fontSize: 16,
    color: '#1E1E1E',
    marginVertical: 12,
  },
  loadingsubTitle: {
    color: '#81919E',
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', // This is important for absolute positioning of the button
  },
  scrollViewContent: {
    padding: 15,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 90,
    borderRadius: 12,
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#4A4A4A',
    fontFamily: 'Gilroy-Regular',
  },
  bio: {
    color: '#81919E',
  },
  more: {
    color: '#3897F0',
  },
  buttons: {
    marginTop: 12,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  outlinedButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 14,
  },
  containedButton: {
    backgroundColor: '#000',
  },
  outlinedButtonText: {
    color: '#4A4A4A',
    fontSize: 11,
  },
  containedButtonText: {
    color: '#fff',
    fontSize: 11,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#fff', // Ensure the button background blends with the container
  },
  seeAllButton: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  seeAllButtonText: {
    color: '#1E1E1E',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
  nocontainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  noResultsContainer: {
    marginTop: '50%',
    justifyContent: 'center', // Center vertically within the nocontainer
    alignItems: 'center', // Center horizontally within the nocontainer
  },
  noResultPlaceholder: {
    width: 135, // Adjust to your desired image width
    height: 115, // Adjust to your desired image height
    marginBottom: 20, // Spacing between the image and the text
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Regular',
  },
  nosubText: {
    color: '#81919E',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Gilroy-Regular',
  },
  findMore: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
  },
  findMoreText: {
    color: '#1E1E1E',
    fontFamily: 'Gilroy-Regular',
    fontWeight: '400',
    fontSize: 12,
  },
});

export default FindingUsers;
