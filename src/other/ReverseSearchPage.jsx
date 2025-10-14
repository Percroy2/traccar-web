import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from '../reports/components/ReportsMenu';
import { useCatch } from '../reactHelper';
import MapView from '../map/core/MapView';
import MapPositions from '../map/MapPositions';
import useReportStyles from '../reports/common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import fetchOrThrow from '../common/util/fetchOrThrow';
import dayjs from 'dayjs';
import ReverseSearchFilter from './ReverseSearchFilter';
  import MapLabels from './MapLabels';

const ReverseSearchPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  // Results
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchZone, setSearchZone] = useState(null);
  const selectedIcon = useRef();

  useEffect(() => {
    if (selectedIcon.current) {
      selectedIcon.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [selectedIcon.current]);

  const onMapPointClick = useCallback((positionId) => {
    const item = items.find((it) => `${it.deviceId}-${it.entryTime}` === positionId);
    setSelectedItem(item);
  }, [items, setSelectedItem]);

  const onSearch = useCatch(async ({ latitude, longitude, radius, from, to, deviceIds, groupIds }) => {
    const query = new URLSearchParams({
      latitude,
      longitude,
      radius,
      from,
      to,
    });
    
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));

    setSearchZone({ latitude, longitude, radius });
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reversesearch?${query.toString()}`);
      const data = await response.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  });

  const onExport = () => {
           const csvContent = [
             ['Device Name', 'License Plate', 'Group Name', 'Entry Time', 'Exit Time', 'Latitude', 'Longitude', 'Distance (m)'].join(','),
             ...items.map(item => [
               item.deviceName || item.name,
               item.licensePlate || '',
               item.groupName,
               dayjs(item.entryTime).format('YYYY-MM-DD HH:mm:ss'),
               item.exitTime ? dayjs(item.exitTime).format('YYYY-MM-DD HH:mm:ss') : 'Still in zone',
               item.latitude?.toFixed(6) || 'N/A',
               item.longitude?.toFixed(6) || 'N/A',
               item.distanceFromCenter?.toFixed(2) || 'N/A',
             ].join(','))
           ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverse-search-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'Recherche Inversée']}>
      <div className={classes.container}>
        {items.length > 0 && (
          <div className={classes.containerMap}>
            <MapView>
              {searchZone && (
                <circle
                  center={[searchZone.longitude, searchZone.latitude]}
                  radius={searchZone.radius}
                  fill="rgba(0, 150, 255, 0.2)"
                  stroke="rgba(0, 150, 255, 0.8)"
                />
              )}
              {items.map((item) => {
                const isSelected = selectedItem && `${selectedItem.deviceId}-${selectedItem.entryTime}` === `${item.deviceId}-${item.entryTime}`;
                return (
                  <MapPositions
                    key={`${item.deviceId}-${item.entryTime}`}
                    positions={[{
                      id: `${item.deviceId}-${item.entryTime}`,
                      latitude: item.latitude || 0,
                      longitude: item.longitude || 0,
                      deviceId: item.deviceId,
                      deviceName: item.deviceName || item.name,
                    }]}
                    onMarkerClick={() => onMapPointClick(`${item.deviceId}-${item.entryTime}`)}
                    selectedPosition={isSelected ? `${item.deviceId}-${item.entryTime}` : null}
                  />
                );
              })}
              <MapLabels items={items} selectedItem={selectedItem} />
            </MapView>
            <MapCamera positions={items.map(item => ({
              latitude: item.latitude || 0,
              longitude: item.longitude || 0,
            }))} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReverseSearchFilter 
              onSearch={onSearch} 
              onExport={onExport} 
              loading={loading} 
              items={items}
            />
          </div>

          {/* Results table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                       <TableCell>{t('sharedDevice')}</TableCell>
                       <TableCell>{t('deviceLicensePlate')}</TableCell>
                       <TableCell>{t('settingsGroups')}</TableCell>
                       <TableCell>{t('Entry Time')}</TableCell>
                       <TableCell>{t('Exit Time')}</TableCell>
                       <TableCell>{t('positionLatitude')}</TableCell>
                       <TableCell>{t('positionLongitude')}</TableCell>
                       <TableCell>{t('Distance (m)')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item) => {
                const isSelected = selectedItem && `${selectedItem.deviceId}-${selectedItem.entryTime}` === `${item.deviceId}-${item.entryTime}`;
                return (
                  <TableRow 
                    key={`${item.deviceId}-${item.entryTime}`}
                    sx={{
                      backgroundColor: isSelected ? 'action.hover' : 'inherit',
                      '&:hover': {
                        backgroundColor: isSelected ? 'action.hover' : 'action.hover',
                      }
                    }}
                  >
                    <TableCell className={classes.columnAction} padding="none">
                      {isSelected ? (
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedItem(null)} 
                          ref={selectedIcon}
                          color="primary"
                        >
                          <GpsFixedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedItem(item)}
                          color="inherit"
                        >
                          <LocationSearchingIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                     <TableCell>{item.name || item.deviceName}</TableCell>
                     <TableCell>{item.licensePlate || '-'}</TableCell>
                     <TableCell>{item.groupName || '-'}</TableCell>
                     <TableCell>{dayjs(item.entryTime).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                     <TableCell>{item.exitTime ? dayjs(item.exitTime).format('YYYY-MM-DD HH:mm:ss') : 'En zone'}</TableCell>
                     <TableCell>{item.latitude?.toFixed(6) || '-'}</TableCell>
                     <TableCell>{item.longitude?.toFixed(6) || '-'}</TableCell>
                     <TableCell>{item.distanceFromCenter?.toFixed(2) || 'N/A'}</TableCell>
                  </TableRow>
                );
              }) : (<TableShimmer columns={9} startAction />)}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default ReverseSearchPage;


