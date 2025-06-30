import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import ProjectGridItem from './ProjectGridItem';
import { useProfile } from '../../hooks/useProfile';
import { Project } from '../../types/profile';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

interface ProjectTabProps {
  userId: string;
  isSelf?: boolean;
  token: string;
  accountType: string;
}

const ProjectTab: React.FC<ProjectTabProps> = ({ userId, isSelf = false, token, accountType }) => {
  console.log("ProjectTab userId:", userId);
  const { projects, fetchProjects, projectsLoading, projectsError } = useProfile();
  console.log("accountType in project tab", accountType);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
useFocusEffect(
  useCallback(() => {
    fetchProjects(userId, !isSelf);
  }, [userId, isSelf])
);
  // useEffect(() => {
  //   fetchProjects(userId, !isSelf);
  // }, [userId, isSelf]);

  // if (projectsLoading) return <Text style={{ textAlign: 'center', marginTop: 24 }}>Loading...</Text>;
  if (projectsError) return <Text style={{ textAlign: 'center', marginTop: 24 }}>Error: {projectsError}</Text>;

  return (
    <View style={{ flex: 1 }}>
      {projects.length === 0 && !projectsLoading ? (
        <View style={[
          styles.noPostContainer,
          accountType === 'personal' ? styles.personalNoPost : styles.businessNoPost
        ]}>
          <Image
            source={require('../../assets/profile/profileTabs/noProject.png')}
            style={styles.noPostImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.noPostText}>No Projects Yet</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ProjectGridItem
              project={item}
              onPress={(project) => navigation.push('ProjectDetailRewamped', {
                feed: project,
                accountType: project.posterDetails?.accountType,
                token: token,
                pageName: 'feed',
                onUpdate: (updatedProject: any) => {
                  // handle update logic if needed
                }
              })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  noPostContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalNoPost: {
    paddingTop: 40,
  },
  businessNoPost: {
    marginBottom: 50,
  },
  noPostImage: {
    width: 100,
    height: 100,
    marginBottom: 14,
    tintColor: Color.black,
  },
  noPostText: {
    color: Color.black,
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.medium,
  },
});

export default ProjectTab; 