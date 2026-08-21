import {
  useMemo,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  alpha,
} from "@mui/material/styles";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

import type {
  TranslationKey,
} from "../../contexts/LanguageContext";

import {
  buildMenu,
} from "../../navigation/buildMenu";

import type {
  NavigationBadge,
  NavigationItem,
} from "../../navigation/types";

import {
  getTickets,
} from "../../services/ticketService";

const drawerWidth = 260;
const collapsedDrawerWidth = 76;

interface SidebarProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarContentProps {
  expanded: boolean;
  onNavigate?: () => void;
}

const finishedStatuses = [
  "concluido",
  "concluído",
  "fechado",
  "finalizado",
  "resolvido",
  "cancelado",
];

const sectionTranslationKeys:
  Record<
    string,
    TranslationKey
  > = {
    main:
      "navigation.main",

    administration:
      "navigation.administration",
  };

const itemTranslationKeys:
  Record<
    string,
    TranslationKey
  > = {
    dashboard:
      "navigation.dashboard",

    tickets:
      "navigation.tickets",

    inventory:
      "navigation.inventory",

    notes:
      "navigation.notes",

    users:
      "navigation.users",

    categories:
      "navigation.categories",

    stores:
      "navigation.stores",

    reports:
      "navigation.reports",

    settings:
      "navigation.settings",
  };

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function getOpenTicketsCount():
  number {
  const tickets =
    getTickets();

  return tickets.filter(
    (ticket) => {
      const normalizedStatus =
        normalizeText(
          String(
            ticket.status
          )
        );

      return !finishedStatuses.includes(
        normalizedStatus
      );
    }
  ).length;
}

function SidebarContent({
  expanded,
  onNavigate,
}: SidebarContentProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
  } =
    useAuth();

  const {
    t,
  } =
    useLanguage();

  const openTicketsCount =
    getOpenTicketsCount();

  const menuSections =
    useMemo(
      () => {
        if (!user) {
          return [];
        }

        return buildMenu(
          user.role
        );
      },
      [
        user,
      ]
    );

  function getSectionTitle(
    sectionId: string,
    fallback: string
  ): string {
    const translationKey =
      sectionTranslationKeys[
        sectionId
      ];

    if (!translationKey) {
      return fallback;
    }

    return t(
      translationKey
    );
  }

  function getItemLabel(
    item: NavigationItem
  ): string {
    const translationKey =
      itemTranslationKeys[
        item.id
      ];

    if (!translationKey) {
      return item.label;
    }

    return t(
      translationKey
    );
  }

  function getBadgeValue(
    badge?:
      NavigationBadge
  ): number | undefined {
    if (
      badge ===
      "openTickets"
    ) {
      return openTicketsCount;
    }

    return undefined;
  }

  function handleNavigate(
    item:
      NavigationItem
  ): void {
    if (
      item.disabled
    ) {
      return;
    }

    navigate(
      item.path
    );

    onNavigate?.();
  }

  function isCurrentRoute(
    path:
      string
  ): boolean {
    if (
      path ===
      "/dashboard"
    ) {
      return (
        location.pathname ===
          "/dashboard" ||
        location.pathname ===
          "/"
      );
    }

    return (
      location.pathname ===
        path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  }

  return (
    <Box
      sx={{
        display:
          "flex",

        flexDirection:
          "column",

        height:
          "100%",

        overflow:
          "hidden",
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            72,

          justifyContent:
            expanded
              ? "flex-start"
              : "center",

          px:
            expanded
              ? 2.25
              : 1,
        }}
      >
        <Box
          sx={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              expanded
                ? 1.5
                : 0,

            width:
              "100%",

            justifyContent:
              expanded
                ? "flex-start"
                : "center",

            overflow:
              "hidden",
          }}
        >
          <Box
            sx={(
              theme
            ) => ({
              width:
                42,

              height:
                42,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                2.5,

              color:
                "primary.main",

              backgroundColor:
                alpha(
                  theme.palette.primary.main,
                  0.12
                ),

              flexShrink:
                0,
            })}
          >
            <SupportAgentIcon
              fontSize="medium"
            />
          </Box>

          {expanded && (
            <Box
              sx={{
                minWidth:
                  0,
              }}
            >
              <Typography
                variant="subtitle1"
                color="text.primary"
                fontWeight={
                  800
                }
                lineHeight={
                  1.25
                }
                noWrap
              >
                Suporte Droga Viva
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {t(
                  "sidebar.supportCenter"
                )}
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>

      <Divider />

      <Box
        sx={{
          flexGrow:
            1,

          overflowY:
            "auto",

          overflowX:
            "hidden",

          py:
            1.5,

          px:
            1,
        }}
      >
        {menuSections.map(
          (
            section,
            sectionIndex
          ) => (
            <Box
              key={
                section.id
              }
              sx={{
                mb:
                  sectionIndex ===
                  menuSections.length -
                    1
                    ? 0
                    : 2,
              }}
            >
              {expanded && (
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{
                    display:
                      "block",

                    px:
                      1.5,

                    mb:
                      0.75,

                    fontSize:
                      "0.67rem",

                    fontWeight:
                      700,

                    letterSpacing:
                      "0.09em",

                    lineHeight:
                      2,
                  }}
                >
                  {getSectionTitle(
                    section.id,
                    section.title
                  )}
                </Typography>
              )}

              {!expanded &&
                sectionIndex >
                  0 && (
                  <Divider
                    sx={{
                      mx:
                        1,

                      my:
                        1.25,
                    }}
                  />
                )}

              <List
                disablePadding
              >
                {section.items.map(
                  (
                    item
                  ) => {
                    const Icon =
                      item.icon;

                    const itemLabel =
                      getItemLabel(
                        item
                      );

                    const badgeValue =
                      getBadgeValue(
                        item.badge
                      );

                    const selected =
                      !item.disabled &&
                      isCurrentRoute(
                        item.path
                      );

                    const menuButton = (
                      <ListItemButton
                        selected={
                          selected
                        }
                        disabled={
                          item.disabled
                        }
                        onClick={() =>
                          handleNavigate(
                            item
                          )
                        }
                        sx={(
                          theme
                        ) => ({
                          position:
                            "relative",

                          minHeight:
                            48,

                          justifyContent:
                            expanded
                              ? "initial"
                              : "center",

                          px:
                            expanded
                              ? 1.5
                              : 1,

                          mb:
                            0.5,

                          borderRadius:
                            2,

                          overflow:
                            "hidden",

                          transition:
                            theme.transitions.create(
                              [
                                "background-color",
                                "color",
                                "transform",
                              ],
                              {
                                duration:
                                  theme
                                    .transitions
                                    .duration
                                    .shorter,
                              }
                            ),

                          "&::before":
                            {
                              content:
                                '""',

                              position:
                                "absolute",

                              left:
                                0,

                              top:
                                8,

                              bottom:
                                8,

                              width:
                                4,

                              borderRadius:
                                "0 4px 4px 0",

                              backgroundColor:
                                selected
                                  ? "primary.main"
                                  : "transparent",

                              transition:
                                "background-color 180ms ease",
                            },

                          "&:hover":
                            {
                              backgroundColor:
                                alpha(
                                  theme.palette.primary.main,
                                  0.08
                                ),

                              transform:
                                item.disabled
                                  ? "none"
                                  : "translateX(2px)",
                            },

                          "&.Mui-selected":
                            {
                              color:
                                "primary.main",

                              backgroundColor:
                                alpha(
                                  theme.palette.primary.main,
                                  0.12
                                ),
                            },

                          "&.Mui-selected:hover":
                            {
                              backgroundColor:
                                alpha(
                                  theme.palette.primary.main,
                                  0.16
                                ),
                            },

                          "&.Mui-disabled":
                            {
                              opacity:
                                0.55,
                            },
                        })}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth:
                              expanded
                                ? 42
                                : 0,

                            justifyContent:
                              "center",

                            color:
                              selected
                                ? "primary.main"
                                : "text.secondary",
                          }}
                        >
                          {!expanded &&
                          badgeValue !==
                            undefined &&
                          badgeValue >
                            0 ? (
                            <Badge
                              badgeContent={
                                badgeValue
                              }
                              color="error"
                              max={
                                99
                              }
                            >
                              <Icon />
                            </Badge>
                          ) : (
                            <Icon />
                          )}
                        </ListItemIcon>

                        {expanded && (
                          <>
                            <ListItemText
                              primary={
                                itemLabel
                              }
                              primaryTypographyProps={{
                                fontSize:
                                  "0.92rem",

                                fontWeight:
                                  selected
                                    ? 700
                                    : 500,

                                noWrap:
                                  true,
                              }}
                            />

                            {badgeValue !==
                              undefined &&
                              badgeValue >
                                0 && (
                                <Chip
                                  label={
                                    badgeValue >
                                    99
                                      ? "99+"
                                      : badgeValue
                                  }
                                  size="small"
                                  color="error"
                                  sx={{
                                    height:
                                      23,

                                    minWidth:
                                      28,

                                    fontWeight:
                                      700,

                                    "& .MuiChip-label":
                                      {
                                        px:
                                          0.8,
                                      },
                                  }}
                                />
                              )}

                            {item.disabled && (
                              <Chip
                                label={t(
                                  "sidebar.comingSoon"
                                )}
                                size="small"
                                variant="outlined"
                                sx={{
                                  ml:
                                    1,

                                  height:
                                    22,

                                  fontSize:
                                    "0.65rem",
                                }}
                              />
                            )}
                          </>
                        )}
                      </ListItemButton>
                    );

                    if (
                      expanded
                    ) {
                      return (
                        <Box
                          key={
                            item.id
                          }
                        >
                          {menuButton}
                        </Box>
                      );
                    }

                    const tooltipTitle =
                      item.disabled
                        ? `${itemLabel} — ${t(
                            "sidebar.comingSoon"
                          )}`
                        : badgeValue !==
                              undefined &&
                            badgeValue >
                              0
                          ? `${itemLabel} — ${badgeValue} ${t(
                              "sidebar.openTickets"
                            )}`
                          : itemLabel;

                    return (
                      <Tooltip
                        key={
                          item.id
                        }
                        title={
                          tooltipTitle
                        }
                        placement="right"
                        arrow
                        enterDelay={
                          300
                        }
                      >
                        <Box>
                          {menuButton}
                        </Box>
                      </Tooltip>
                    );
                  }
                )}
              </List>
            </Box>
          )
        )}
      </Box>

      <Box
        sx={{
          px:
            1,

          pb:
            1.5,
        }}
      >
        <Divider
          sx={{
            mb:
              1.5,
          }}
        />

        {expanded ? (
          <Box
            sx={(
              theme
            ) => ({
              px:
                1.5,

              py:
                1.25,

              borderRadius:
                2,

              backgroundColor:
                alpha(
                  theme.palette.primary.main,
                  0.06
                ),
            })}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t(
                "sidebar.operationalSystem"
              )}
            </Typography>

            <Typography
              variant="caption"
              color="success.main"
              fontWeight={
                700
              }
            >
              ●{" "}
              {t(
                "sidebar.allServicesOnline"
              )}
            </Typography>
          </Box>
        ) : (
          <Tooltip
            title={t(
              "sidebar.allServicesOnline"
            )}
            placement="right"
            arrow
          >
            <Box
              sx={{
                display:
                  "flex",

                justifyContent:
                  "center",

                py:
                  1,
              }}
            >
              <Box
                sx={{
                  width:
                    10,

                  height:
                    10,

                  borderRadius:
                    "50%",

                  backgroundColor:
                    "success.main",

                  boxShadow: (
                    theme
                  ) =>
                    `0 0 0 4px ${alpha(
                      theme.palette.success.main,
                      0.14
                    )}`,
                }}
              />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function Sidebar({
  desktopOpen,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const {
    t,
  } =
    useLanguage();

  const currentDesktopWidth =
    desktopOpen
      ? drawerWidth
      : collapsedDrawerWidth;

  return (
    <Box
      component="nav"
      aria-label={t(
        "sidebar.mainMenu"
      )}
      sx={{
        flexShrink: {
          md:
            0,
        },
      }}
    >
      <Drawer
        variant="temporary"
        open={
          mobileOpen
        }
        onClose={
          onMobileClose
        }
        ModalProps={{
          keepMounted:
            true,
        }}
        sx={{
          display: {
            xs:
              "block",

            md:
              "none",
          },

          "& .MuiDrawer-paper":
            {
              width:
                drawerWidth,

              boxSizing:
                "border-box",

              borderRight:
                "1px solid",

              borderColor:
                "divider",
            },
        }}
      >
        <SidebarContent
          expanded
          onNavigate={
            onMobileClose
          }
        />
      </Drawer>

      <Drawer
        variant="permanent"
        open={
          desktopOpen
        }
        sx={{
          display: {
            xs:
              "none",

            md:
              "block",
          },

          width:
            currentDesktopWidth,

          flexShrink:
            0,

          whiteSpace:
            "nowrap",

          "& .MuiDrawer-paper":
            {
              width:
                currentDesktopWidth,

              boxSizing:
                "border-box",

              overflowX:
                "hidden",

              borderRight:
                "1px solid",

              borderColor:
                "divider",

              transition: (
                theme
              ) =>
                theme.transitions.create(
                  "width",
                  {
                    easing:
                      theme
                        .transitions
                        .easing
                        .sharp,

                    duration:
                      desktopOpen
                        ? theme
                            .transitions
                            .duration
                            .enteringScreen
                        : theme
                            .transitions
                            .duration
                            .leavingScreen,
                  }
                ),
            },
        }}
      >
        <SidebarContent
          expanded={
            desktopOpen
          }
        />
      </Drawer>
    </Box>
  );
}

export default Sidebar;

export {
  collapsedDrawerWidth,
  drawerWidth,
};