// import dependencies
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

// import local files
import Modal from '../components/ui/modal';
import useContextStore from '../context';
import { createGetRequest } from '../services/axios';
import { fetchMonitorById } from '../services/monitor/fetch';
import {
  LocalStorageStateProvider,
  useLocalStorageState,
} from '../hooks/useLocalstorage';

const GlobalLayout = ({ children }) => {
  const {
    modalStore: { isOpen, content, glassmorph },
    globalStore: { setMonitors, setTimeouts },
    userStore: { setUser },
    notificationStore: { setNotifications },
    statusStore: { setStatusPages },
    incidentStore: { setIncidents },
  } = useContextStore();

  const navigate = useNavigate();

  const localStorageState = useLocalStorageState();

  useEffect(() => {
    const fetchMontiors = async () => {
      try {
        const user = await createGetRequest('/api/user');
        const monitors = await createGetRequest('/api/user/monitors');
        const notifications = await createGetRequest('/api/notifications');
        const statusPages = await createGetRequest('/api/status-pages');
        const incidents = await createGetRequest('/api/incident/all');
        const data = monitors?.data || [];

        setUser(user?.data);
        setMonitors(data);
        setTimeouts(data, fetchMonitorById);
        setNotifications(notifications?.data || []);
        setStatusPages(statusPages?.data || []);
        setIncidents(incidents?.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          return navigate('/login');
        }
        if (error.response?.status === 403) {
          return navigate('/verify');
        }
        navigate('/error');
      }
    };

    fetchMontiors();
  }, []);

  return (
    <LocalStorageStateProvider value={localStorageState}>
      {isOpen && (
        <Modal.Container glassmorph={glassmorph}>{content}</Modal.Container>
      )}
      {children}
    </LocalStorageStateProvider>
  );
};

GlobalLayout.displayName = 'GlobalLayout';

GlobalLayout.propTypes = {
  children: PropTypes.node,
};

export default observer(GlobalLayout);
