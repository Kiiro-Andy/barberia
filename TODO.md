# TODO: Update BookingScreen to fetch barbers from profiles table

- [x] Add state for barbers array
- [x] Add fetchBarbers function in useEffect to query profiles table for rol == 'barbero'
- [x] Remove hardcoded BARBERS constant
- [x] Update StepBarber component to map over barbers state
- [x] Remove specialty display in StepBarber (since not in profiles)
- [x] Update all references to barber.name to barber.nombre
