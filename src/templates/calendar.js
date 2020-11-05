import React, {useState, useEffect, useContext} from 'react';
import {Row, Column, Wrapper, WrapperImage, Divider, Div} from '../components/Sections'
import {H2, H3, H4, H5, Title, Separator, Paragraph} from '../components/Heading'
import {Colors, Button, Img, Anchor} from '../components/Styling'
import Card from '../components/Card'
import Icon from '../components/Icon'
import Select from '../components/Select'
import BaseRender from './_baseLayout'
import dayjs from "dayjs"
import LazyLoad from 'react-lazyload';
import {SessionContext} from '../session'

const ListCard = ({image, onClick, title, date, address, link}) => <Column size="4" size_sm="12" margin="0 0 1rem 0">
  <Anchor to={link}>
    <Card
      overflow={`hidden`}
      height="auto"
      width="100%"
      shadow
    >
      <LazyLoad scroll={true} height={230}>
        <Img
          src={image}
          bsize="cover"
          mb="10px"
          border="1.25rem 1.25rem 0 0"
          position="center center"
          height="180px"
          h_lg="120px"
          h_md="140px"
          h_sm="220px"
        />
      </LazyLoad>
      <Row
        marginLeft="0"
        marginRight="0"
        padding={`15px`}>
        <Column size="12"
          onClick={() => onClick(index)}>
          <Row marginBottom="1rem" >
            <H4
              fs_xs="18px"
              fs_sm="18px"
              fs_md="16px"
              fs_lg="16px"
              fontSize="20px"
            >{title}
            </H4>
          </Row>
          <Row marginBottom=".2rem" alignItems={`center`} >
            <Icon icon="clock" width="24" color={Colors.blue} fill={Colors.blue} />
            <Paragraph
              margin={`0 0 0 10px`}
              fs_xs="18px"
              fs_sm="18px"
              fs_md="9px"
              fs_lg="11px"
              fs_xl="14px">
              {dayjs(date).add(5, "hour").format("ddd, DD MMM YYYY")}
            </Paragraph>
          </Row>
          <Row marginBottom=".2rem" alignItems={`center`} >
            <Icon icon="marker" width="24" color={Colors.blue} fill={Colors.blue} />
            <Paragraph
              margin={`0 0 0 10px`}
              fs_xs="18px"
              fs_sm="18px"
              fs_md="9px"
              fs_lg="11px"
              fs_xl="14px">
              {address}
            </Paragraph>
          </Row>
          <Row height="5%" justifyContent="end">
            <a href={`#`} target="_blank" rel="noopener noreferrer">
              <Icon icon="arrowright"
                width="32"
                color={Colors.blue}
                fill={Colors.blue} />
            </a>
          </Row>
        </Column>
      </Row>
    </Card>
  </Anchor>
</Column>;

const Calendar = (props) => {
  const {pageContext, yml} = props;
  const {session} = useContext(SessionContext);

  const [data, setData] = useState({
    events: {catalog: [], all: [], filtered: []},
    cohorts: {catalog: [], all: [], filtered: []}
  });
  const [academy, setAcademy] = useState(null)
  const [filterType, setFilterType] = useState({label: "Upcoming Courses and Events", value: "cohorts"});

  useEffect(() => {
    const getData = async () => {
      let resp = await fetch(`${process.env.GATSBY_BREATHECODE_HOST}/admissions/cohort/all?upcoming=true`);
      let cohorts = await resp.json();
      let resp2 = await fetch(`${process.env.GATSBY_BREATHECODE_HOST}/events/all`);
      let events = await resp2.json();
      let _types = []
      for (let i = 0; i < events.length; i++) {
        if (events[i].event_type && !_types.includes(events[i].event_type.name)) {
          _types.push({label: events[i].event_type.name, value: events[i].event_type.name})
        }
      }
      setData(oldData => ({
        events: {catalog: _types, all: events, filtered: events},
        cohorts: {catalog: oldData.cohorts.catalog, all: cohorts, filtered: cohorts}
      }))
    }
    getData();
  }, []);

  useEffect(() => {
    if (session && Array.isArray(session.locations)) {
      const _data = {
        ...data,
        cohorts: {
          ...data.cohorts,
          catalog: [{label: 'All Locations', value: null}].concat(
            session.locations.map(l => ({label: l.city, value: l.breathecode_location_slug}))
          )
        }
      }
      setData(_data);
    }
  }, [session]);

  return (
    <>
      <WrapperImage
        imageData={yml.header.image && yml.header.image.childImageSharp.fluid}
        border="bottom"
        bgSize="cover"
        paddingRight={`0`}
        customBorderRadius="0 0 0 1.25rem"
      >
        <Divider height="100px" />
        <Title
          size="5"
          type="h1"
          title={yml.header.tagline}
          variant="main"
          color={Colors.white}
          textAlign="center"
        />
      </WrapperImage>
      <Wrapper border="top" color={Colors.white}>
        <Divider height="50px" />
        <Row marginBottom={`10px`} justifyContent={`end`}>
          <a href={`https://www.meetup.com/4Geeks-Academy/`} target="_blank" rel="noopener noreferrer">
            <Button width="100%" outline color={Colors.blue} textColor={Colors.blue} margin="1rem 0 .2rem 0" padding=".35rem.85rem">
              Join Our Meetup
            </Button>
          </a>
          <H4 margin="20px 0 0 0" align="left" a_sm="left">Filter courses and events:</H4>
        </Row>

        <Row
          padding={`10px 20px`}
          background={Colors.lightGray}
          borderRadius={`.5rem`}
          alignItems={`center`}
          customRespSize
          alignResp={`space-between`}
          flexDirection_sm={`column`}
        >
          <Select
            top="40px"
            left="20px"
            width="300px"
            m_sm="5px"
            maxWidth="100%"
            options={console.log("catalog", data.cohorts.catalog) || data.cohorts.catalog}
            openLabel={academy ? "Campus: " + academy.label : "Select one academy"}
            closeLabel={academy ? "Campus: " + academy.label : "Select one academy"}
            onSelect={(opt) => {
              setAcademy(opt)
              setData({
                ...data,
                [filterType.value]: {
                  ...data[filterType.value],
                  filtered: data[filterType.value].all.filter(elm => elm.academy.slug === opt.value)
                }
              });
            }}
          />
          <Select
            top="40px"
            left="20px"
            width="300px"
            maxWidth="100%"
            m_sm="5px"
            options={[
              {label: "Courses", value: "cohorts"},
              {label: "Events", value: "events"}
            ]}
            openLabel={filterType.label}
            closeLabel={filterType.label}
            onSelect={(opt) => setFilterType(opt)}
          />
        </Row>
      </Wrapper>
      <Wrapper border="top">
        <Row>
          {
            filterType.value === "cohorts" ?
              data.cohorts.filtered.length == 0 ?
                <Paragraph margin={`0 0 0 10px`} fontSize="18px">
                  {academy != null ? "It seems we could not found any result." : "Loading..."}
                </Paragraph>
                :
                data.cohorts.filtered.map((cohort, index) =>
                  <ListCard
                    key={index}
                    title={cohort.certificate.name}
                    address={`${cohort.academy.city.name}, ${cohort.academy.country.name}`}
                    image={cohort.academy.logo_url}
                    link={`/${session ? session.language : "us"}/${cohort.certificate.slug}`}
                    date={cohort.kickoff_date}
                  />
                )
              :
              data.events.filtered.length === 0 ?
                <Paragraph margin={`0 0 0 10px`} fontSize="18px">
                  {academy != null ? "It seems we could not found any result." : "Loading..."}
                </Paragraph>
                :
                data.events.filtered.map((event, index) =>
                  <ListCard
                    key={index}
                    title={event.title}
                    address={event.online_event ? "Online" : event.academy.city ? event.academy.city.name : event.academy.name}
                    image={event.banner}
                    link={event.url}
                    date={event.starting_at}
                    exerpt={event.exerpt}
                  />
                )
          }
        </Row>
      </Wrapper>

      <Divider height="50px" />

    </>
  )
};
export const query = graphql`
  query EventsQuery($file_name: String!, $lang: String!) {
    allPageYaml(filter: { fields: { file_name: { eq: $file_name }, lang: { eq: $lang }}}) {
      edges{
        node{
          
          meta_info{
            slug
            title
            description
            image
            keywords
          }
          header{
            tagline
            sub_heading
            image{
              childImageSharp {
                fluid(maxWidth: 1500){
                  ...GatsbyImageSharpFluid_withWebp
                }
              }
            } 
          }
          
        }
      }
    }
    cohort_img: file(relativePath: { eq: "images/events-alt.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`;
export default BaseRender(Calendar);