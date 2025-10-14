import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TextField, FormControl, InputLabel, Select, MenuItem, Slider, Typography,
  Autocomplete, CircularProgress, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import SelectField from '../common/components/SelectField';
import useReportStyles from '../reports/common/useReportStyles';
import dayjs from 'dayjs';

const ReverseSearchFilter = ({ onSearch, onExport, loading, items }) => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(500); // meters
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState(dayjs().subtract(1, 'hour').locale('en').format('YYYY-MM-DDTHH:mm'));
  const [customTo, setCustomTo] = useState(dayjs().locale('en').format('YYYY-MM-DDTHH:mm'));
  
  // Autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  
  const deviceIds = searchParams.getAll('deviceId').map(Number);
  const groupIds = searchParams.getAll('groupId').map(Number);

  // Autocomplete address suggestions
  const fetchAddressSuggestions = useCatch(async (inputValue) => {
    if (!inputValue || inputValue.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // Use Nominatim search API for suggestions
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&limit=5&addressdetails=1&countrycodes=fr`);
      const suggestions = await response.json();
      
      const formattedSuggestions = suggestions.map(item => ({
        label: `${item.display_name}`,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name
      }));
      
      setAddressSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  });

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAddressSuggestions(addressInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [addressInput]);

  // Handle address selection from autocomplete
  const handleAddressSelect = (selectedAddress) => {
    if (selectedAddress) {
      setLatitude(selectedAddress.lat.toString());
      setLongitude(selectedAddress.lon.toString());
      setAddressInput(selectedAddress.label);
    }
  };

  const handleSearch = () => {
    if (!latitude || !longitude) {
      alert(t('Please enter coordinates or geocode an address'));
      return;
    }

    let selectedFrom;
    let selectedTo;
    switch (period) {
      case 'today':
        selectedFrom = dayjs().startOf('day');
        selectedTo = dayjs().endOf('day');
        break;
      case 'yesterday':
        selectedFrom = dayjs().subtract(1, 'day').startOf('day');
        selectedTo = dayjs().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        selectedFrom = dayjs().startOf('week');
        selectedTo = dayjs().endOf('week');
        break;
      case 'previousWeek':
        selectedFrom = dayjs().subtract(1, 'week').startOf('week');
        selectedTo = dayjs().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        selectedFrom = dayjs().startOf('month');
        selectedTo = dayjs().endOf('month');
        break;
      case 'previousMonth':
        selectedFrom = dayjs().subtract(1, 'month').startOf('month');
        selectedTo = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        selectedFrom = dayjs(customFrom, 'YYYY-MM-DDTHH:mm');
        selectedTo = dayjs(customTo, 'YYYY-MM-DDTHH:mm');
        break;
    }

    onSearch({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius,
      from: selectedFrom.toISOString(),
      to: selectedTo.toISOString(),
      deviceIds,
      groupIds,
    });
  };

  const updateReportParams = (key, values) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    values.forEach((value) => newParams.append(key, value));
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className={classes.filter}>
      {/* Address geocoding with autocomplete */}
      <div className={classes.filterItem}>
        <Autocomplete
          freeSolo
          options={addressSuggestions}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
          loading={loadingSuggestions}
          onInputChange={(event, newInputValue) => {
            setAddressInput(newInputValue);
          }}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue === 'object') {
              handleAddressSelect(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Adresse (recherche automatique)"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <div {...props}>
              <div>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {option.label.split(',')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.label.split(',').slice(1).join(',').trim()}
                </Typography>
              </div>
            </div>
          )}
        />
      </div>

      {/* Radius slider */}
      <div className={classes.filterItem}>
        <Typography variant="body2" gutterBottom>
          Rayon de recherche: {radius}m
        </Typography>
        <Slider
          value={radius}
          onChange={(e, newValue) => setRadius(newValue)}
          min={100}
          max={5000}
          step={100}
          valueLabelDisplay="auto"
        />
      </div>

      {/* Device & Group filters */}
      <div className={classes.filterItem}>
        <SelectField
          label="Appareils"
          endpoint="/api/devices"
          value={deviceIds}
          onChange={(e) => updateReportParams('deviceId', e.target.value)}
          multiple
          fullWidth
        />
      </div>
      <div className={classes.filterItem}>
        <SelectField
          label="Groupes"
          endpoint="/api/groups"
          value={groupIds}
          onChange={(e) => updateReportParams('groupId', e.target.value)}
          multiple
          fullWidth
        />
      </div>

      {/* Time period */}
      <div className={classes.filterItem}>
        <FormControl fullWidth>
          <InputLabel>Période</InputLabel>
          <Select label="Période" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="today">Aujourd'hui</MenuItem>
            <MenuItem value="yesterday">Hier</MenuItem>
            <MenuItem value="thisWeek">Cette semaine</MenuItem>
            <MenuItem value="previousWeek">Semaine précédente</MenuItem>
            <MenuItem value="thisMonth">Ce mois</MenuItem>
            <MenuItem value="previousMonth">Mois précédent</MenuItem>
            <MenuItem value="custom">Personnalisé</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <>
          <div className={classes.filterItem}>
            <TextField
              label="De"
              type="datetime-local"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <TextField
              label="À"
              type="datetime-local"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              fullWidth
            />
          </div>
        </>
      )}

      {/* Search & Export buttons */}
      <div className={classes.filterItem}>
        <Button
          onClick={handleSearch}
          disabled={loading || !latitude || !longitude}
          variant="contained"
          fullWidth
          startIcon={<SearchIcon />}
        >
          Rechercher
        </Button>
      </div>
      {items.length > 0 && (
        <div className={classes.filterItem}>
          <Button 
            onClick={onExport} 
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon />}
          >
            Exporter CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReverseSearchFilter;