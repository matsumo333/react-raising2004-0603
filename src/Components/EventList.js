import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, arrayUnion, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './EventList.scss';
import { Link, useNavigate } from 'react-router-dom';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [userEventParticipation, setUserEventParticipation] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") === "true");

  useEffect(() => {
    const fetchData = async () => {
      // イベント一覧を取得
      const eventCollection = collection(db, 'events');
      const eventSnapshot = await getDocs(eventCollection);
      const eventList = eventSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);

      // イベントメンバー一覧を取得
      const eventMembersCollection = collection(db, 'event_members');
      const eventMembersSnapshot = await getDocs(eventMembersCollection);
      const eventMembersList = eventMembersSnapshot.docs.map((doc) => doc.data());
      setEventMembers(eventMembersList);

      // ユーザー情報を取得
      const user = auth.currentUser;
      setCurrentUser(user);
      if (user) {
        const userId = user.uid;

        // ユーザーの参加イベント情報を取得
        const userEventMembers = eventMembers.filter(member => member.memberId === userId);
        const userParticipation = userEventMembers.reduce((acc, member) => {
          acc[member.eventId] = true;
          return acc;
        }, {});
        setUserEventParticipation(userParticipation);

        // ユーザーがメンバーかどうかをチェック
        const allMembersQuery = query(collection(db, 'members'), where('author.id', '==', userId));
        const allMembersSnapshot = await getDocs(allMembersQuery);
        const membersData = allMembersSnapshot.docs.map(doc => doc.data());
        const filteredMembers = membersData.filter(member => member.author.id === userId);
        if (filteredMembers.length === 0) {
          alert('あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。');
          navigate('/member');
        }
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchParticipantCounts = () => {
      const counts = events.reduce((acc, event) => {
        const participants = eventMembers.filter(member => member.eventId === event.id);
        acc[event.id] = participants.length;
        return acc;
      }, {});
      setParticipantCounts(counts);
    };

    fetchParticipantCounts();
  }, [events, eventMembers]);

  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      console.log('User is not logged in');
      alert('ログインしてください');
      navigate('/login');
      return;
    }
  
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      participants: arrayUnion(currentUser.uid)
    });
  
    // ユーザーのアカウント名を取得
    const userQuery = query(collection(db, 'members'), where('author.id', '==', currentUser.uid));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      alert('あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。');
      navigate('/member');
      return;
    }
    const userData = userSnapshot.docs[0].data();
    const accountname = userData.accountname;
  
    // イベントメンバーに新しいドキュメントを追加
    await addDoc(collection(db, 'event_members'), {
      eventId: eventId,
      memberId: currentUser.uid,
      accountname: accountname // accountname を追加
    });
  
    navigate('/confirmation');
  };
  

  const handleDelete = async (id) => {
    console.log("きてtrue" + id);
    await deleteDoc(doc(db, "events", id));
    navigate("/eventedit");
  };

  return (
    <div className="eventListContainer">
      <h1>イベント一覧</h1>
      <table>
        <thead>
          <tr>
            <th style={{ width: '350px' }} className='event_title'>タイトル</th>
            <th className='event_title'>開催場所</th>
            <th className='event_title'>コート数</th>
            <th className='event_title'>定員</th>
            <th className='event_title'>現在参加人数</th>
            <th className='event_title'>コート面</th>
            <th className='event_title'>参加者</th>
            <th className='event_title'>参加</th>
            <th className='event_title'>削除</th>
            <th className='event_title'>編集</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={index}>
              <td>{event.title}</td>
              <td>{event.site_region}</td>
              <td>{event.court_count}</td>
              <td>{event.capacity}</td>
              <td>{participantCounts[event.id]}</td>
              <td>{event.court_surface}</td>
              <td>
                <div className="participantList">
                  <ParticipantList eventId={event.id} eventMembers={eventMembers} navigate={navigate} />
                </div>
              </td>
              <td>
                {userEventParticipation[event.id] ? (
                  <span className='sankasumi'>参加表明済みです</span>
                ) : (
                  <button onClick={() => handleJoinEvent(event.id)}>
                    参加する
                  </button>
                )}
              </td>
              <td>
                <button onClick={() => handleDelete(event.id)}>削除</button>
              </td>
              <td>
                <Link to={`/eventedit/${event.id}`}>編集する</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ParticipantList = ({ eventId, eventMembers, navigate }) => {
  const filteredMembers = eventMembers.filter(member => member.eventId === eventId);
  const participantButtons = filteredMembers.map(member => (
    <button key={member.memberId} onClick={() => navigate(`/eventcancel/${eventId}`)} style={{ fontSize: '16px', padding: '1px', marginBottom: '1px', backgroundColor: 'rgb(25, 51, 223)' }}>
      {member.accountname}
    </button>
  ));

  return (
    <div>
      {participantButtons}
    </div>
  );
};

export default EventList;
