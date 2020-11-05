export const mockTimelineData = [
  {
    ship: {
      vessel_name: 'Baltic Tern',
      imo: 9313199,
      nationality: '',
      from: '',
      to: '',
      type: 'bulk carrier',
      loa: '230 meters',
      beam: '37 meters',
      draft: '6,1 meters',
    },
    portcalls: [
      {
        id: 1, // random number generated for react array keys
        events: [
          {
            location: 'sea-entering', // for identifying drawable sets
            id: 11, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 1',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 1',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 1',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'land', // for identifying drawable sets
            id: 12, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 2',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 2',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 2',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'sea-leaving', // for identifying drawable sets
            id: 13, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 3',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 3',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 3',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
        ],
      },
      {
        id: 2, // random number generated for react array keys
        events: [
          {
            location: 'sea-entering', // for identifying drawable sets
            id: 21, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 4',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 4',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 4',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'land', // for identifying drawable sets
            id: 22, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 5',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 5',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 5',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'sea-leaving', // for identifying drawable sets
            id: 23, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 6',
                time: '2019-10-22T09:30:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 6',
                time: '2019-10-22T21:00:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 6',
                time: '2019-10-23T11:10:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    ship: {
      vessel_name: 'BBC Edge',
      imo: 9407598,
      nationality: '',
      from: '',
      to: '',
      type: 'bulk carrier',
      loa: '230 meters',
      beam: '37 meters',
      draft: '6,1 meters',
    },
    portcalls: [
      {
        id: 3, // random number generated for react array keys
        events: [
          {
            location: 'sea-entering', // for identifying drawable sets
            id: 31, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 7',
                time: '2019-10-26T18:05:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Arrival_Vessel_Berth 7',
                time: '2019-10-27T17:50:00+00:00',
                time_type: 'Actual',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 7',
                time: '2019-10-31T12:05:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'land', // for identifying drawable sets
            id: 32, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 8',
                time: '2019-10-26T18:05:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Arrival_Vessel_Berth 8',
                time: '2019-10-27T17:50:00+00:00',
                time_type: 'Actual',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 8',
                time: '2019-10-31T12:05:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
          {
            location: 'sea-leaving', // for identifying drawable sets
            id: 33, // random number generated for react array keys
            timestamps: [
              {
                payload: '[""]',
                state: 'Arrival_Vessel_PortArea 9',
                time: '2019-10-26T18:05:00+00:00',
                time_type: 'Estimated',
              },
              {
                payload: '[""]',
                state: 'Arrival_Vessel_Berth 9',
                time: '2019-10-27T17:50:00+00:00',
                time_type: 'Actual',
              },
              {
                payload: '[""]',
                state: 'Departure_Vessel_Berth 9',
                time: '2019-10-31T12:05:00+00:00',
                time_type: 'Actual',
              },
            ],
          },
        ],
      },
    ],
  },
];
