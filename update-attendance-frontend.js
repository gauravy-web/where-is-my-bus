const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'WheresMyBus', 'src', 'screens', 'AdminScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Updating AdminScreen.js for Date-Wise Attendance History...');

// 1. Add new state variables in the constructor or state initialization
const stateAddition = `
    // Date-Wise Attendance History state
    this.state.attendanceDate = '';
    this.state.attendanceBusFilter = '';
    this.state.attendanceSummary = null;
    this.state.attendanceLoading = false;
    this.state.dayTrips = { pickup: null, drop: null };
    this.state.historicalAttendance = [];
`;

// Find where state is initialized (after existing state declarations)
const sosFilterIndex = content.indexOf("this.state.sosFilter = 'active';");
if (sosFilterIndex !== -1) {
  const insertPoint = content.indexOf(';', sosFilterIndex) + 1;
  content = content.substring(0, insertPoint) + stateAddition + content.substring(insertPoint);
  console.log('✓ Added attendance history state variables');
}

// 2. Add loadAttendanceByDate function before renderAttend
const loadAttendanceFunction = `
  loadAttendanceByDate = async () => {
    const { attendanceDate, attendanceBusFilter } = this.state;

    if (!attendanceDate || !attendanceBusFilter) {
      Alert.alert('Missing Info', 'Please select both date and bus');
      return;
    }

    this.setState({ attendanceLoading: true });

    try {
      const response = await fetch(
        \`\${API_BASE_URL}/api/attendance?busId=\${attendanceBusFilter}&date=\${attendanceDate}\`,
        { headers: { Authorization: \`Bearer \${this.state.token}\` } }
      );

      const data = await response.json();

      if (data.success) {
        this.setState({
          attendanceSummary: data.summary,
          dayTrips: data.dayTrips,
          historicalAttendance: data.attendance,
          attendanceLoading: false,
        });
      } else {
        Alert.alert('Error', 'Failed to load attendance');
        this.setState({ attendanceLoading: false });
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance history');
      this.setState({ attendanceLoading: false });
    }
  };
`;

// Insert before renderAttend
const renderAttendIndex = content.indexOf('renderAttend() {');
if (renderAttendIndex !== -1) {
  content = content.substring(0, renderAttendIndex) + loadAttendanceFunction + '\n  ' + content.substring(renderAttendIndex);
  console.log('✓ Added loadAttendanceByDate function');
}

// 3. Replace renderAttend function with new version
const newRenderAttend = `renderAttend() {
    const {
      attendanceDate,
      attendanceBusFilter,
      attendanceSummary,
      attendanceLoading,
      dayTrips,
      buses,
    } = this.state;

    return (
      <ScrollView style={{ padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          Date-Wise Bus Attendance History
        </Text>

        {/* Date Picker */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: '600' }}>Select Date:</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              backgroundColor: '#fff',
            }}
            placeholder="YYYY-MM-DD"
            value={attendanceDate}
            onChangeText={(text) => this.setState({ attendanceDate: text })}
          />
        </View>

        {/* Bus Filter */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: '600' }}>Select Bus:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {buses.map((bus) => (
              <TouchableOpacity
                key={bus.id}
                onPress={() => this.setState({ attendanceBusFilter: bus.id })}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderRadius: 20,
                  backgroundColor: attendanceBusFilter === bus.id ? '#007AFF' : '#f0f0f0',
                }}
              >
                <Text style={{ color: attendanceBusFilter === bus.id ? '#fff' : '#333' }}>
                  {bus.busNo} - {bus.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Load Button */}
        <TouchableOpacity
          onPress={this.loadAttendanceByDate}
          style={{
            backgroundColor: '#007AFF',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {attendanceLoading ? 'Loading...' : 'Load Attendance'}
          </Text>
        </TouchableOpacity>

        {/* Summary Card */}
        {attendanceSummary && (
          <View
            style={{
              backgroundColor: '#f9f9f9',
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Summary</Text>
            <Text>Total Students: {attendanceSummary.total}</Text>
            <Text style={{ color: 'green' }}>Present: {attendanceSummary.present}</Text>
            <Text style={{ color: 'red' }}>Absent: {attendanceSummary.absent}</Text>
            <Text style={{ color: 'orange' }}>Not Marked: {attendanceSummary.notMarked}</Text>
          </View>
        )}

        {/* Route Display */}
        {dayTrips.pickup && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#FF8C00' }}>
              Pickup Route
            </Text>
            <View style={{ backgroundColor: '#FFF8DC', padding: 10, borderRadius: 8 }}>
              {dayTrips.pickup.stops.map((stop, index) => (
                <View
                  key={stop.id}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 5,
                    borderBottomWidth: index < dayTrips.pickup.stops.length - 1 ? 1 : 0,
                    borderBottomColor: '#ddd',
                  }}
                >
                  <Text style={{ fontWeight: '600', marginRight: 10 }}>{stop.order}.</Text>
                  <Text style={{ flex: 1 }}>{stop.name}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {stop.status || 'PENDING'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dayTrips.drop && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#1E90FF' }}>
              Drop Route
            </Text>
            <View style={{ backgroundColor: '#E6F3FF', padding: 10, borderRadius: 8 }}>
              {dayTrips.drop.stops.map((stop, index) => (
                <View
                  key={stop.id}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 5,
                    borderBottomWidth: index < dayTrips.drop.stops.length - 1 ? 1 : 0,
                    borderBottomColor: '#ddd',
                  }}
                >
                  <Text style={{ fontWeight: '600', marginRight: 10 }}>{stop.order}.</Text>
                  <Text style={{ flex: 1 }}>{stop.name}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {stop.status || 'PENDING'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  }`;

// Replace renderAttend function
const renderAttendStart = content.indexOf('renderAttend() {');
const renderAttendEnd = content.indexOf('\n  render', renderAttendStart);
if (renderAttendStart !== -1 && renderAttendEnd !== -1) {
  content = content.substring(0, renderAttendStart) + newRenderAttend + '\n' + content.substring(renderAttendEnd);
  console.log('✓ Replaced renderAttend with Date-Wise Attendance History UI');
}

// Backup
const backupPath = filePath + '.backup-attendance';
fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'), 'utf8');
console.log('✓ Backup created: AdminScreen.js.backup-attendance');

// Write updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Updated: AdminScreen.js');
console.log('\nChanges made:');
console.log('  - Added attendance history state variables');
console.log('  - Added loadAttendanceByDate function');
console.log('  - Replaced renderAttend with date picker, bus filter, summary, and route display');
console.log('\nRestart your app to see changes!');
