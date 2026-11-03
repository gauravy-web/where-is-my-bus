const fs = require("fs");
const f = "d:/where is my bus/WheresMyBus/src/screens/AdminScreen.js";
let c = fs.readFileSync(f, "utf8");

// Step 1: Add state variables
const i1 = c.indexOf("const [attendance,  setAttendance]  = useState([]);");
const i2 = c.indexOf("\n", i1) + 1;
const newStates = `  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceBusFilter, setAttendanceBusFilter] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [dayTrips, setDayTrips] = useState({ pickup: null, drop: null });
  const [historicalAttendance, setHistoricalAttendance] = useState([]);
`;
c = c.substring(0, i2) + newStates + c.substring(i2);
console.log("Step 1: Added state variables");

// Step 2: Add loadAttendanceByDate function before renderAttend
const renderAttendIdx = c.indexOf("const renderAttend = () => (");
const loadFunc = `
  const loadAttendanceByDate = async () => {
    if (!attendanceDate || !attendanceBusFilter) {
      Alert.alert('Missing Info', 'Please select both date and bus');
      return;
    }
    setAttendanceLoading(true);
    try {
      const response = await fetch(\`\${API}/api/attendance?busId=\${attendanceBusFilter}&date=\${attendanceDate}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      const data = await response.json();
      if (data.success) {
        setAttendanceSummary(data.summary);
        setDayTrips(data.dayTrips);
        setHistoricalAttendance(data.attendance);
        setAttendanceLoading(false);
      } else {
        Alert.alert('Error', 'Failed to load attendance');
        setAttendanceLoading(false);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance history');
      setAttendanceLoading(false);
    }
  };

`;
c = c.substring(0, renderAttendIdx) + loadFunc + c.substring(renderAttendIdx);
console.log("Step 2: Added loadAttendanceByDate function");

// Step 3: Replace renderAttend completely
const newRenderAttend = `const renderAttend = () => (
    <ScrollView style={{ padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Date-Wise Bus Attendance History</Text>
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: '600' }}>Select Date:</Text>
        <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff' }} placeholder="YYYY-MM-DD" value={attendanceDate} onChangeText={setAttendanceDate} />
      </View>
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: '600' }}>Select Bus:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {buses.map((bus) => (
            <TouchableOpacity key={bus.id} onPress={() => setAttendanceBusFilter(bus.id)} style={{ paddingHorizontal: 15, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: attendanceBusFilter === bus.id ? '#007AFF' : '#f0f0f0' }}>
              <Text style={{ color: attendanceBusFilter === bus.id ? '#fff' : '#333' }}>{bus.busNo} - {bus.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity onPress={loadAttendanceByDate} style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{attendanceLoading ? 'Loading...' : 'Load Attendance'}</Text>
      </TouchableOpacity>
      {attendanceSummary && (
        <View style={{ backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Summary</Text>
          <Text>Total Students: {attendanceSummary.total}</Text>
          <Text style={{ color: 'green' }}>Present: {attendanceSummary.present}</Text>
          <Text style={{ color: 'red' }}>Absent: {attendanceSummary.absent}</Text>
          <Text style={{ color: 'orange' }}>Not Marked: {attendanceSummary.notMarked}</Text>
        </View>
      )}
      {dayTrips.pickup && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#FF8C00' }}>Pickup Route</Text>
          <View style={{ backgroundColor: '#FFF8DC', padding: 10, borderRadius: 8 }}>
            {dayTrips.pickup.stops.map((stop, index) => (
              <View key={stop.id} style={{ flexDirection: 'row', paddingVertical: 5, borderBottomWidth: index < dayTrips.pickup.stops.length - 1 ? 1 : 0, borderBottomColor: '#ddd' }}>
                <Text style={{ fontWeight: '600', marginRight: 10 }}>{stop.order}.</Text>
                <Text style={{ flex: 1 }}>{stop.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{stop.status || 'PENDING'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {dayTrips.drop && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#1E90FF' }}>Drop Route</Text>
          <View style={{ backgroundColor: '#E6F3FF', padding: 10, borderRadius: 8 }}>
            {dayTrips.drop.stops.map((stop, index) => (
              <View key={stop.id} style={{ flexDirection: 'row', paddingVertical: 5, borderBottomWidth: index < dayTrips.drop.stops.length - 1 ? 1 : 0, borderBottomColor: '#ddd' }}>
                <Text style={{ fontWeight: '600', marginRight: 10 }}>{stop.order}.</Text>
                <Text style={{ flex: 1 }}>{stop.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{stop.status || 'PENDING'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );`;

const renderStart = c.indexOf("const renderAttend = () => (");
const renderEnd = c.indexOf("\n  // -- SOS --", renderStart);
c = c.substring(0, renderStart) + newRenderAttend + "\n" + c.substring(renderEnd);
console.log("Step 3: Replaced renderAttend function");

fs.writeFileSync(f, c);
console.log("\n? AdminScreen.js updated successfully!");
