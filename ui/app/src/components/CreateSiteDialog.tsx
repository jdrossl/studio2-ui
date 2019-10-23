/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import BlueprintCard from './BlueprintCard';
import Spinner from "./Spinner";
import InputBase from '@material-ui/core/InputBase';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import DialogActions from '@material-ui/core/DialogActions';
import BlueprintForm from './BlueprintForm';
import BlueprintReview from "./BlueprintReview";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import ConfirmDialog from "./ConfirmDialog";
import { Blueprint } from '../models/Blueprint';
import { Site, SiteState, Views } from '../models/Site';
import { defineMessages, useIntl } from 'react-intl';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import PluginDetailsView from "./PluginDetailsView";
import EmptyState from "./EmptyState";
import { underscore } from '../utils/string';
import { setRequestForgeryToken } from '../utils/auth';
import { checkHandleAvailability, createSite, fetchBlueprints as fetchBuiltInBlueprints } from "../services/sites";
import { fetchBlueprints as fetchMarketplaceBlueprints } from "../services/marketplace";
import gitLogo from "../assets/git-logo.svg";
import Cookies from 'js-cookie';
import { backgroundColor } from '../styles/theme';
// @ts-ignore
import { fadeIn } from 'react-animations';

const views: Views = {
  0: {
    title: 'Create Site',
    subtitle: 'Choose creation strategy: start from an existing Git repo or create based on a blueprint that suits you best.'
  },
  1: {
    title: 'Create Site',
    subtitle: 'Name and describe your site',
    btnText: 'Review'
  },
  2: {
    title: 'Finish',
    subtitle: 'Review set up summary and create your site',
    btnText: 'Create Site'
  }
};

const siteInitialState: SiteState = {
  blueprint: null,
  siteId: '',
  siteIdExist: false,
  invalidSiteId: false,
  description: '',
  pushSite: false,
  useRemote: false,
  createAsOrphan: false,
  repoUrl: '',
  repoAuthentication: 'none',
  repoRemoteBranch: '',
  sandboxBranch: '',
  repoRemoteName: '',
  repoPassword: '',
  repoUsername: '',
  repoToken: '',
  repoKey: '',
  submitted: false,
  selectedView: 0,
  details: {blueprint: null, index: null},
  blueprintFields: {},
};

const CustomTabs = withStyles({
  root: {
    borderBottom: 'none',
    minHeight: 'inherit'
  }
})(Tabs);

const dialogTitleStyles = () => ({
  root: {
    margin: 0,
    padding: '20px',
    paddingBottom: '20px',
    background: backgroundColor
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': fadeIn,
  fadeIn: {
    animationName: '$fadeIn',
    animationDuration: '1s',
  },
  paperScrollPaper: {
    height: 'calc(100% - 100px)',
    maxHeight: '1200px'
  },
  searchContainer:{
    position: 'absolute',
    background: 'white',
    padding: '20px',
    width: '100%',
    left: '50%',
    transform: 'translate(-50%)',
    zIndex: 1,
  },
  search: {
    width: '100%',
    margin: 'auto',
    position: 'relative'
  },
  searchIcon: {
    width: theme.spacing(7),
    color: '#828282',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  searchRoot: {
    color: 'inherit',
    width: '100%'
  },
  searchInput: {
    padding: theme.spacing(1, 1, 1, 7),
    width: '100%',
    backgroundColor: backgroundColor,
    borderRadius: '5px',
    border: 0,
    '&:focus': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0px 0px 3px rgba(65, 69, 73, 0.15), 0px 4px 4px rgba(65, 69, 73, 0.15)'
    }
  },
  dialogContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  dialogContent: {
    padding: '0',
    position: 'relative'
  },
  slide: {
    padding: 20,
    flexWrap: 'wrap',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    '&.selected': {
      height: '100%',
      paddingTop: '77px',
    }
  },
  dialogActions: {
    background: backgroundColor,
    padding: '8px 20px'
  },
  backBtn: {
    marginRight: 'auto'
  },
  tabs: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    background: backgroundColor
  },
  simpleTab: {
    minWidth: '80px',
    minHeight: '0',
    padding: '0 0 5px 0',
    marginRight: '20px',
    opacity: 1,
    '& span': {
      textTransform: 'none',
      color: '#2F2707'
    }
  },
  tabIcon: {
    color: '#000000',
    fontSize: '1.2rem',
    cursor: 'pointer',
    '&.selected': {
      color: theme.palette.primary.main
    }
  },
  loading: {
    position: 'relative',
    padding: 16,
    flexGrow: 1
  }
}));

const DialogTitle = withStyles(dialogTitleStyles)((props: any) => {
  const {classes, onClose, selectedView} = props;
  const {title, subtitle} = views[selectedView];
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon/>
          </IconButton>
        ) : null}
      </div>
      <Typography variant="subtitle1">{subtitle}</Typography>
    </MuiDialogTitle>
  );
});

const messages = defineMessages({
  privateBlueprints: {
    id: 'createSiteDialog.privateBlueprints',
    defaultMessage: 'Private Blueprints'
  },
  marketplace: {
    id: 'common.marketplace',
    defaultMessage: 'Marketplace'
  },
  publicMarketplace: {
    id: 'createSiteDialog.publicMarketplace',
    defaultMessage: 'Public Marketplace'
  },
  back: {
    id: 'common.back',
    defaultMessage: 'Back'
  },
  noBlueprints: {
    id: 'createSiteDialog.noBlueprints',
    defaultMessage: 'No Blueprints Where Found'
  },
  changeQuery: {
    id: 'createSiteDialog.changeQuery',
    defaultMessage: 'Try changing your query or browse the full catalog.'
  },
  creatingSite: {
    id: 'createSiteDialog.creatingSite',
    defaultMessage: 'Creating Site'
  },
  pleaseWait: {
    id: 'createSiteDialog.pleaseWait',
    defaultMessage: 'Please wait while your site is being created..'
  },
  createInBackground: {
    id: 'createSiteDialog.createInBackground',
    defaultMessage: 'Create in Background'
  },
  dialogCloseTitle: {
    id: 'createSiteDialog.dialogCloseTitle',
    defaultMessage: 'Confirm Close'
  },
  dialogCloseMessage: {
    id: 'createSiteDialog.dialogCloseMessage',
    defaultMessage: 'Data entered in the form would be lost upon closing.'
  },
  gitBlueprintName: {
    id: 'createSiteDialog.gitBlueprintName',
    defaultMessage: 'Remote Git Repository'
  },
  gitBlueprintDescription: {
    id: 'createSiteDialog.gitBlueprintDescription',
    defaultMessage: 'Create a new site based on a Crafter CMS project in an existing, remote git repository.'
  }
});

function CreateSiteDialog() {
  const [blueprints, setBlueprints] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState({
    open: true,
    inProgress: false,
  });
  const [apiState, setApiState] = useState({
    creatingSite: false,
    error: false,
    global: false,
    errorResponse: null,
  });
  const [search, setSearch] = useState({
    searchKey: '',
    searchSelected: false
  });
  const [site, setSite] = useState(siteInitialState);
  const classes = useStyles({});
  const finishRef = useRef(null);

  const {formatMessage} = useIntl();

  function filterBlueprints(blueprints: Blueprint[], searchKey: string) {
    searchKey = searchKey.toLowerCase();
    return searchKey && blueprints
      ? blueprints.filter(blueprint => blueprint.name.toLowerCase().includes(searchKey))
      : blueprints;
  }

  const filteredBlueprints: Blueprint[] = filterBlueprints(blueprints, search.searchKey);
  const filteredMarketplace: Blueprint[] = filterBlueprints(marketplace, search.searchKey);

  setRequestForgeryToken();

  useEffect(() => {
      if (tab === 0 && blueprints === null && !apiState.error) {
        getBlueprints();
      }
      if (tab === 1 && marketplace === null && !apiState.error) {
        getMarketPlace()
      }
      if(finishRef && site.selectedView === 2) {
        finishRef.current.focus();
      }
    },
    // eslint-disable-next-line
    [tab, filteredBlueprints, filteredMarketplace, search.searchSelected, site.selectedView],
  );

  function handleClose(event?:any, reason?: string) {
    if((reason === 'escapeKeyDown') && site.details.blueprint) {
      setSite({...site, details: { blueprint: null, index: null}});
    } else if((reason === 'escapeKeyDown') && isFormOnProgress()){
      setDialog({...dialog, inProgress: true });
    } else {
      setDialog({...dialog, open: false });
    }
  }

  function onConfirmOk() {
    setDialog({...dialog, open: false, inProgress: false });
  }

  function onConfirmCancel() {
    setDialog({...dialog, inProgress: false });
  }

  function isFormOnProgress() {
    let inProgress = false;
    const keys = [
      'siteId',
      'description',
      'repoUrl',
      'repoAuthentication',
      'repoRemoteBranch',
      'sandboxBranch',
      'repoRemoteName',
      'repoPassword',
      'repoUsername',
      'repoToken',
      'repoKey'
    ];

    keys.forEach((key: string) => {
      if (site[key] !== siteInitialState[key]) {
        inProgress = true;
      }
    });

    Object.keys(site.blueprintFields).forEach((key: string) => {
      if(site.blueprintFields[key] !== '') {
        inProgress = true;
      }
    });

    return inProgress;
  }

  function handleCloseDetails() {
    setSite({...site, details: {blueprint: null, index: null}});
  }

  function handleErrorBack() {
    setApiState({...apiState, error: false, global: false});
  }

  function handleSearchClick() {
    setSearch({...search, searchSelected: !search.searchSelected, searchKey: ''});
  }

  function handleBlueprintSelected(blueprint: Blueprint, view: number) {
    if (blueprint.id === 'GIT') {
      setSite({
        ...site,
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: false,
        details: {blueprint: null, index: null}
      })
    } else if (blueprint.source === 'GIT') {
      setSite({
        ...site,
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: true,
        details: {blueprint: null, index: null}
      })
    } else {
      setSite({
        ...site,
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        createAsOrphan: true,
        details: {blueprint: null, index: null}
      })
    }
  }

  function handleBack() {
    let back = site.selectedView - 1;
    setSite({...site, selectedView: back});
  }

  function handleChange(e: Object, value: number) {
    setTab(value);
  }

  function handleGoTo(step: number) {
    setSite({...site, selectedView: step});
  }

  function handleFinish(e: MouseEvent) {
    e && e.preventDefault();
    if (site.selectedView === 1) {
      setSite({...site, submitted: true});
    }
    if (validateForm()) {
      if (site.selectedView === 2) {
        const params = createParams();
        setApiState({...apiState, creatingSite: true});
        createNewSite(params);
      } else {
        setSite({...site, selectedView: 2});
      }
    }
  }

  function checkAdditionalFields() {
    let valid = true;
    if (site.blueprint.parameters) {
      site.blueprint.parameters.forEach(parameter => {
        if (parameter.required && !site.blueprintFields[parameter.name]) {
          valid = false;
        }
      });
    }
    return valid;
  }

  function validateForm() {
    if (!site.siteId || site.siteIdExist || site.invalidSiteId) {
      return false;
    } else if (!site.repoUrl && site.blueprint.id === 'GIT') {
      return false;
    } else if (site.pushSite) {
      if (!site.repoUrl) return false;
      else if (site.repoAuthentication === 'basic' && (!site.repoUsername || !site.repoPassword)) return false;
      else if (site.repoAuthentication === 'token' && (!site.repoUsername || !site.repoToken)) return false;
      else return !(site.repoAuthentication === 'key' && !site.repoKey);
    } else {
      return checkAdditionalFields();
    }
  }

  function createParams() {
    if (site.blueprint) {
      const params: Site = {
        siteId: site.siteId,
        description: site.description,
        singleBranch: false,
        authenticationType: site.repoAuthentication,
        createAsOrphan: site.createAsOrphan
      };
      if (site.blueprint.id !== 'GIT' && site.blueprint.source !== 'GIT') {
        params.blueprint = site.blueprint.id;
        params.useRemote = site.pushSite;
      } else {
        params.useRemote = true;
      }
      //it is from marketplace
      if (site.blueprint.source === 'GIT') {
        params.remoteUrl = site.blueprint.url;
        params.remoteBranch = site.blueprint.ref;
        params.remoteName = 'origin';
      }
      if (site.repoRemoteName) params.remoteName = site.repoRemoteName;
      if (site.repoUrl) params.remoteUrl = site.repoUrl;
      if (site.repoRemoteBranch) {
        params.remoteBranch = site.repoRemoteBranch;
      }
      if (site.sandboxBranch) params.sandboxBranch = site.sandboxBranch;
      if (site.repoAuthentication === 'basic') {
        params.remoteUsername = site.repoUsername;
        params.remotePassword = site.repoPassword;
      }
      if (site.repoAuthentication === 'token') {
        params.remoteUsername = site.repoUsername;
        params.remoteToken = site.repoToken;
      }
      if (site.repoAuthentication === 'key') params.remotePrivateKey = site.repoKey;
      if (site.blueprintFields) params.siteParams = site.blueprintFields;
      params.createOption = site.pushSite ? 'push' : 'clone';

      //TODO# remove this when change to Api2
      let _params: any = {};
      Object.keys(params).forEach(key => {
        _params[underscore(key)] = params[key];
      });
      return _params;
    }
  }

  function createNewSite(site: Site) {
    createSite(site)
      .subscribe(
        () => {
          setApiState({...apiState, creatingSite: false});
          handleClose();
          //TODO# Change to site.siteId when create site is on API2
          Cookies.set('crafterSite', site.site_id, {
            domain: window.location.hostname.includes('.') ? window.location.hostname : '',
            path: '/'
          });
          window.location.href = '/studio/preview/#/?page=/&site=' + site.site_id;
        },
        ({response}) => {
          //TODO# I'm wrapping the API response as a API2 response, change it when create site is on API2
          const _response = {...response, code: '', documentationUrl: '', remedialAction: ''};
          setApiState({...apiState, creatingSite: false, error: true, errorResponse: _response, global: true});
        }
      )
  }

  function getMarketPlace() {
    fetchMarketplaceBlueprints()
      .subscribe(
        ({response}) => {
          setMarketplace(response.plugins);
        },
        ({response}) => {
          if (response) {
            setApiState({...apiState, creatingSite: false, error: true, errorResponse: response.response});
          }
        }
      );
  }

  function getBlueprints() {
    fetchBuiltInBlueprints()
      .subscribe(
        ({response}) => {
          const _blueprints: [Blueprint] = [{
            id: 'GIT',
            name: formatMessage(messages.gitBlueprintName),
            description: formatMessage(messages.gitBlueprintDescription),
            media: {
              screenshots: [
                {
                  description: '',
                  title: formatMessage(messages.gitBlueprintName),
                  url: gitLogo
                }
              ],
              videos: []
            }
          }];
          response.blueprints.forEach((bp: any) => {
            _blueprints.push(bp.plugin);
          });
          setBlueprints(_blueprints);
        },
        ({response}) => {
          if (response) {
            setApiState({...apiState, creatingSite: false, error: true, errorResponse: response.response});
          }
        }
      );
  }

  function checkNameExist(e: any) {
    if (e.target.value) {
      checkHandleAvailability(e.target.value)
        .subscribe(
          ({response}) => {
            setSite({...site, siteIdExist: response.exists});
          },
          ({response}) => {
            //TODO# I'm wrapping the API response as a API2 response, change it when create site is on API2
            const _response = {...response, code: '', documentationUrl: '', remedialAction: ''};
            setApiState({...apiState, creatingSite: false, error: true, errorResponse: _response});
          }
        );
    }
  }

  function onDetails(blueprint: Blueprint, index: number) {
    setSite({...site, details: {blueprint: blueprint, index: index}});
  }

  function renderBlueprints(list: Blueprint[]) {
    if (list.length === 0) {
      return (
        <EmptyState title={formatMessage(messages.noBlueprints)} subtitle={formatMessage(messages.changeQuery)}/>
      )
    }
    return list.map((item: Blueprint) => {
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={item.id}>
          <BlueprintCard blueprint={item} onBlueprintSelected={handleBlueprintSelected} interval={5000}
                         onDetails={onDetails}/>
        </Grid>
      );
    })
  }

  return (
    <Dialog open={dialog.open} onClose={handleClose} aria-labelledby="create-site-dialog" disableBackdropClick={true}
            fullWidth={true} maxWidth={'lg'} classes={{paperScrollPaper: classes.paperScrollPaper}}>
      <ConfirmDialog open={dialog.inProgress} onOk={onConfirmOk} onClose={onConfirmCancel} description={formatMessage(messages.dialogCloseMessage)} title={formatMessage(messages.dialogCloseTitle)}/>
      {(apiState.creatingSite || (apiState.error && apiState.global) || site.details.blueprint) ?
        (apiState.creatingSite &&
            <LoadingState title={formatMessage(messages.creatingSite)} subtitle={formatMessage(messages.pleaseWait)}
                          subtitle2={formatMessage(messages.createInBackground)}/>) ||
        (apiState.error &&
            <ErrorState error={apiState.errorResponse} onBack={handleErrorBack} background={backgroundColor}/>) ||
        (site.details && <PluginDetailsView blueprint={site.details.blueprint} selectedIndex={site.details.index}
                                            onBlueprintSelected={handleBlueprintSelected}
                                            onCloseDetails={handleCloseDetails} interval={5000}/>) :
        <div className={classes.dialogContainer}>
          <DialogTitle id="create-site-dialog" onClose={handleClose} selectedView={site.selectedView}/>
          {
            (site.selectedView === 0) &&
            <div className={classes.tabs}>
                <CustomTabs value={tab} onChange={handleChange} aria-label="blueprint tabs">
                    <Tab label={formatMessage(messages.privateBlueprints)} className={classes.simpleTab}/>
                    <Tab label={formatMessage(messages.publicMarketplace)} className={classes.simpleTab}/>
                </CustomTabs>
                <SearchIcon className={clsx(classes.tabIcon, search.searchSelected && 'selected')}
                            onClick={handleSearchClick}/>
            </div>
          }
          {
            ((tab === 0 && blueprints) || (tab === 1 && marketplace)) ?
              <DialogContent className={classes.dialogContent}>
                {
                  (search.searchSelected && site.selectedView === 0) &&
                  <div className={classes.searchContainer}>
                      <div className={classes.search}>
                          <div className={classes.searchIcon}>
                              <SearchIcon/>
                          </div>
                          <InputBase
                              placeholder="Search…"
                              autoFocus={true}
                              classes={{
                                root: classes.searchRoot,
                                input: classes.searchInput,
                              }}
                              value={search.searchKey}
                              onChange={e => setSearch({...search, searchKey: e.target.value})}
                              inputProps={{'aria-label': 'search'}}
                          />
                      </div>
                  </div>
                }
                {(site.selectedView === 0) &&
                <div className={clsx(classes.slide, classes.fadeIn, search.searchSelected && 'selected')}>
                  {
                    (tab === 0) ?
                      <Grid container spacing={3}>{renderBlueprints(filteredBlueprints)}</Grid>
                      :
                      <Grid container spacing={3}>{renderBlueprints(filteredMarketplace)}</Grid>
                  }
                </div>}
                {(site.selectedView === 1) && <div className={clsx(classes.slide, classes.fadeIn)}>
                  {
                    site.blueprint &&
                    <BlueprintForm inputs={site} setInputs={setSite}
                                   onSubmit={handleFinish} onCheckNameExist={checkNameExist}
                                   blueprint={site.blueprint}/>
                  }
                </div>}
                {(site.selectedView === 2) && <div className={clsx(classes.slide, classes.fadeIn)}>
                  {site.blueprint &&
                  <BlueprintReview onGoTo={handleGoTo} inputs={site} blueprint={site.blueprint}/>}
                </div>}
              </DialogContent>
              : apiState.error ? <ErrorState error={apiState.errorResponse}/> :
              <div className={classes.loading}>
                <Spinner/>
              </div>
          }
          {
            (site.selectedView !== 0) &&
            <DialogActions className={clsx(classes.dialogActions, classes.fadeIn)}>
                <Button variant="contained" className={classes.backBtn} onClick={handleBack}>
                  {formatMessage(messages.back)}
                </Button>
                <Button ref={finishRef} variant="contained" color="primary" onClick={handleFinish}>
                  {views[site.selectedView].btnText}
                </Button>
            </DialogActions>
          }
        </div>}
    </Dialog>
  )
}

export default CreateSiteDialog;