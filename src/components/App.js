import '../index.css';
import SideBar from './SideBar.js';
import Header from './Header.js';
import Main from './Main.js';
import Login from './Login.js';
import Register from './Register.js';
import InfoToolTip from './InfoToolTip.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js';
import DeleteCardPopup from './DeleteCardPopup.js';
import ImagePopup from './ImagePopup.js';
import Footer from './Footer.js';
import { useState, useEffect, memo } from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import * as auth from '../utils/auth.js';
import ProtectedRouteElement from './ProtectedRoute.js';

const App = memo(() => {
  
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] = useState(false);
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false);
  const [isSuccessfully, setIsSuccessfully] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getUserInfo()
      .then((info) => {
        setCurrentUser(info);
      })
      .catch(err => console.log(err));
  }, [])

  useEffect(() => {
    api.getInitialCards()
      .then((data) => {
        const result = data.map((card) => ({
          id: card._id,
          name: card.name,
          link: card.link,
          likes: card.likes,
          owner: card.owner
        }));
        setCards(result);
      })
      .catch(err => console.log(err));
  }, [])

  useEffect(() => {
    const close = (evt) => {
      if (evt.key === 'Escape') {
        closeAllPopups();
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    tokenCheck();
  }, [loggedIn]) 

  function tokenCheck() {
    if (localStorage.getItem('jwt')) {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        auth.getContent(jwt)
          .then((res) => {
            if (res) {
              setEmail(res.data.email);
              setLoggedIn(true);
              navigate('/', {replace: true});
            }
            return;
          })
          .catch(err => console.log(err));
      }
      return;
    }
    return;
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(card.id, !isLiked)
      .then((data) => {
        const newCard = {
          id: data._id,
          name: data.name,
          link: data.link,
          likes: data.likes,
          owner: data.owner
        }
        setCards((state) => state.map((c) => c.id === card.id ? newCard : c));
      })
      .catch(err => console.log(err));
  }

  function handleCardDelete(card) {
    api.deleteCard(card.id)
      .then(() => {
        setCards((state) => state.filter((c) => c.id === card.id ? '' : c));
        closeAllPopups();
      })
      .catch(err => console.log(err));
  }

  function handleUpdateUser({name, about}) {
    setIsLoading(true);
    api.patchUserInfo({name, about})
      .then((info) => {
        setCurrentUser(info);
        closeAllPopups();
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar({avatar}) {
    setIsLoading(true);
    api.patchUserAvatar(avatar)
      .then((info) => {
        setCurrentUser(info);
        closeAllPopups();
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));;
  }

  function handleAddPlaceSubmit({name, link}) {
    setIsLoading(true);
    api.postNewCard({name, link})
      .then((data) => {
        const newCard = {
          id: data._id,
          name: data.name,
          link: data.link,
          likes: data.likes,
          owner: data.owner
        }
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }

  function openSideBar() {
    setIsSideBarOpen(true);
  }

  function closeSideBar() {
    setIsSideBarOpen(false);
  }

  function onLogin() {
    setLoggedIn(true);
  }

  function onRegister(value) {
    setIsInfoToolTipOpen(true);
    setIsSuccessfully(value);
  }

  function onSignOut() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    closeSideBar();
    setEmail('');
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setIsImagePopupOpen(true);
    setSelectedCard(card);
  }

  function handleDeleteButtonClick(card) {
    setIsDeleteCardPopupOpen(true);
    setSelectedCard(card);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsDeleteCardPopupOpen(false);
    setIsInfoToolTipOpen(false);
    setSelectedCard({});
  }
  
  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <SideBar email={email} onSignOut={onSignOut} isOpen={isSideBarOpen} />
        <Header loggedIn={loggedIn} email={email} isOpen={isSideBarOpen} onSignOut={onSignOut} onOpen={openSideBar} onClose={closeSideBar} />
        <Routes>
          {/* <Route path="/" element={loggedIn ? <Navigate to="/mesto-react" replace /> : <Navigate to="/sign-in" replace />} /> */}
          <Route path="/" element={<ProtectedRouteElement
            element={Main}
            onEditProfile={handleEditProfileClick} 
            onAddPlace={handleAddPlaceClick} 
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleDeleteButtonClick}
            cards={cards}
            loggedIn={loggedIn}
          />} />
          <Route path="/sign-up" element={<Register onRegister={onRegister} />} />
          <Route path="/sign-in" element={<Login onLogin={onLogin} />} />
        </Routes>
        <InfoToolTip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          isSuccessfully={isSuccessfully}
        />
        <EditProfilePopup 
          isOpen={isEditProfilePopupOpen} 
          onClose={closeAllPopups} 
          onUpdateUser={handleUpdateUser} 
          isLoading={isLoading}
        />
        <AddPlacePopup 
          isOpen={isAddPlacePopupOpen} 
          onClose={closeAllPopups} 
          onAddPlace={handleAddPlaceSubmit}
          isLoading={isLoading}
        />
        <EditAvatarPopup 
          isOpen={isEditAvatarPopupOpen} 
          onClose={closeAllPopups} 
          onUpdateAvatar={handleUpdateAvatar}
          isLoading={isLoading}
        />
        <DeleteCardPopup 
          isOpen={isDeleteCardPopupOpen} 
          onClose={closeAllPopups} 
          onCardDelete={handleCardDelete} 
          card={selectedCard} 
        />
        <ImagePopup 
          card={selectedCard} 
          isOpen={isImagePopupOpen} 
          onClose={closeAllPopups} 
        />
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
})

export default App;
